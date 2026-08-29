import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MemberEvent, MemberStatus } from "@prisma/client";
import { PrismaService } from "@/database/prisma/prisma.service";
import { ClientLoginDto } from "./dto/client-login.dto";
import { ClientQrLoginDto } from "./dto/client-qr-login.dto";
import { RegisterMemberDto } from "./dto/register-member.dto";

const SESSION_EXPIRY = "30m";

@Injectable()
export class MemberAuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	async loginByCpf(companyId: string, deviceId: string, dto: ClientLoginDto) {
		const member = await this.prisma.member.findFirst({
			where: {
				companyId,
				OR: [{ cpf: dto.identifier }, { matricula: dto.identifier }],
			},
		});

		if (!member) {
			throw new NotFoundException(
				"CPF não identificado. Verifique e tente novamente.",
			);
		}

		return this.issueSession(
			member.id,
			member.companyId,
			deviceId,
			MemberEvent.LOGIN_CPF_SUCCESS,
		);
	}

	/**
	 * TODO: o totem ainda não tem um emissor de QR (carteirinha digital) —
	 * até existir, o token do QR é tratado como o mesmo identifier de
	 * CPF/matrícula usado no login manual, para o endpoint não ficar travado.
	 */
	async loginByQrCode(
		companyId: string,
		deviceId: string,
		dto: ClientQrLoginDto,
	) {
		const member = await this.prisma.member.findFirst({
			where: {
				companyId,
				OR: [{ cpf: dto.token }, { matricula: dto.token }],
			},
		});

		if (!member) {
			throw new NotFoundException("QR Code não reconhecido.");
		}

		return this.issueSession(
			member.id,
			member.companyId,
			deviceId,
			MemberEvent.LOGIN_QR_SUCCESS,
		);
	}

	/**
	 * Cadastro 100% local — nenhuma chamada à CloudGym (ou a qualquer outro
	 * provedor) acontece aqui. A empresa é sempre dona dos seus próprios
	 * dados; vincular esse aluno a um provedor externo (CloudGym, Gympass,
	 * TotalPass, Wellhub) é uma ação separada e opcional que ele faz depois,
	 * pela tela de agregadores (ver AggregatorLoginService) — não algo
	 * decidido no cadastro pela empresa como um todo. `dto.planId` sempre
	 * referencia um PlanContent local (ver PlanService.findAllForCompany).
	 */
	async register(companyId: string, deviceId: string, dto: RegisterMemberDto) {
		if (dto.cpf) {
			const existing = await this.prisma.member.findFirst({
				where: { companyId, cpf: dto.cpf },
			});
			if (existing) {
				throw new ConflictException(
					"Já existe um cliente cadastrado com este CPF.",
				);
			}
		}

		const member = await this.registerLocal(companyId, deviceId, dto);

		return this.issueSession(member.id, member.companyId, deviceId, undefined);
	}

	private async registerLocal(
		companyId: string,
		deviceId: string,
		dto: RegisterMemberDto,
	) {
		const plan = await this.prisma.planContent.findFirst({
			where: { id: dto.planId, companyId, cloudgymPlanId: null },
		});
		if (!plan) {
			throw new NotFoundException("Plano não encontrado.");
		}

		return this.prisma.member.create({
			data: {
				companyId,
				cpf: dto.cpf,
				name: dto.name,
				email: dto.email,
				phone: dto.phone,
				status: MemberStatus.ACTIVE,
				contracts: {
					create: {
						planName: plan.name,
						price: plan.price,
						status: "ACTIVE",
						startDate: new Date(),
						/** Dia de vencimento nasce do próprio dia do cadastro; o aluno pode trocar depois (PATCH /member/me/contract/due-date). */
						dueDay: new Date().getDate(),
						raw: { extras: dto.extras ?? [] },
					},
				},
				logs: {
					create: {
						deviceId,
						event: MemberEvent.REGISTERED_TOTEM,
						description: "Cadastro realizado pelo totem.",
						metadata: { extras: dto.extras ?? [] },
					},
				},
			},
		});
	}

	/** Emite o JWT de sessão do cliente pra um memberId já resolvido — usado tanto pelos logins locais (CPF/matrícula/QR/cadastro) quanto pelo login de agregador (que resolve o member por fora, direto na API do provedor). */
	async issueSession(
		memberId: string,
		companyId: string,
		deviceId: string,
		logEvent?: MemberEvent,
	) {
		const member = await this.prisma.member.findUniqueOrThrow({
			where: { id: memberId },
		});

		if (logEvent) {
			await this.prisma.memberLog.create({
				data: { memberId, deviceId, event: logEvent },
			});
		}

		const accessToken = this.jwtService.sign(
			{ sub: member.id, deviceId, companyId, type: "client" },
			{ expiresIn: SESSION_EXPIRY },
		);

		return {
			accessToken,
			expiresIn: SESSION_EXPIRY,
			member: {
				id: member.id,
				name: member.name,
				points: member.points,
			},
		};
	}
}
