import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MemberEvent, MemberStatus } from "@prisma/client";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CloudgymClientService } from "@/modules/cloudgym/cloudgym-client.service";
import { ClientLoginDto } from "./dto/client-login.dto";
import { ClientQrLoginDto } from "./dto/client-qr-login.dto";
import { RegisterMemberDto } from "./dto/register-member.dto";

const SESSION_EXPIRY = "30m";
/** Usado quando o wizard de cadastro do totem ainda não coleta forma de pagamento. */
const DEFAULT_METHOD_PAYMENT = "CC";

@Injectable()
export class MemberAuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly cloudgymClient: CloudgymClientService,
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

		const integration = await this.prisma.cloudgymIntegration.findUnique({
			where: { companyId },
		});

		const member = integration
			? await this.registerWithCloudgym(companyId, deviceId, dto)
			: await this.registerLocal(companyId, deviceId, dto);

		return this.issueSession(member.id, member.companyId, deviceId, undefined);
	}

	private async registerWithCloudgym(
		companyId: string,
		deviceId: string,
		dto: RegisterMemberDto,
	) {
		const cloudgymResponse = await this.cloudgymClient.createMember(companyId, {
			name: dto.name,
			cpf: dto.cpf,
			email: dto.email,
			cellPhoneNumber: dto.phone,
			plan: Number(dto.planId),
			methodPayment: dto.methodPayment ?? DEFAULT_METHOD_PAYMENT,
		});

		const cloudgymMemberId = this.tryParseId(cloudgymResponse);

		return this.prisma.member.create({
			data: {
				companyId,
				cloudgymMemberId,
				cpf: dto.cpf,
				name: dto.name,
				email: dto.email,
				phone: dto.phone,
				status: MemberStatus.ACTIVE,
				contracts: {
					create: {
						cloudgymPlanId: Number(dto.planId),
						status: "ACTIVE",
						startDate: new Date(),
						raw: { extras: dto.extras ?? [] },
					},
				},
				logs: {
					create: {
						deviceId,
						event: MemberEvent.REGISTERED_TOTEM,
						description: "Cadastro realizado pelo totem.",
						metadata: { extras: dto.extras ?? [], cloudgymResponse },
					},
				},
			},
		});
	}

	/**
	 * Empresa sem CloudgymIntegration — cadastro 100% local, sem nenhuma
	 * chamada à CloudGym. `dto.planId` referencia um PlanContent local
	 * (ver PlanService.findLocalPlans).
	 */
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
						raw: { extras: dto.extras ?? [] },
					},
				},
				logs: {
					create: {
						deviceId,
						event: MemberEvent.REGISTERED_TOTEM,
						description: "Cadastro realizado pelo totem (empresa sem CloudGym).",
						metadata: { extras: dto.extras ?? [] },
					},
				},
			},
		});
	}

	private async issueSession(
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

	private tryParseId(raw: unknown): number | undefined {
		const value = Number(raw);
		return Number.isFinite(value) && !Number.isNaN(value) ? value : undefined;
	}
}
