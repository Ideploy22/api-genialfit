import {
	Injectable,
	NotFoundException,
	NotImplementedException,
} from "@nestjs/common";
import { AggregatorProvider, MemberEvent, MemberStatus } from "@prisma/client";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CloudgymClientService } from "@/modules/cloudgym/cloudgym-client.service";
import { MemberAuthService } from "@/modules/member/member-auth.service";

export interface AggregatorLoginResult {
	externalId: string;
	name: string;
	isFirstAccess: boolean;
}

const CLOUDGYM_STATUS_MAP: Record<string, MemberStatus> = {
	active: MemberStatus.ACTIVE,
	inactive: MemberStatus.INACTIVE,
};

/**
 * Validação real do token junto à API de cada agregador (Gympass/TotalPass/
 * Wellhub) depende de credenciais/contrato próprios com cada provedor, que
 * ainda não existem neste projeto — por decisão do usuário, esses seguem só
 * com a estrutura pronta (rota, DTO, tabela MemberAggregatorLink).
 *
 * CloudGym é diferente: já tem credenciais reais (CloudgymIntegration) e
 * (confirmado em 2026-08-29) `GET /customer/{unitId}?filter=cpf:<cpf>`
 * funciona — ver `CloudgymClientService.findCustomerByCpf`. O "token" aqui é
 * o CPF do aluno.
 *
 * Esse fluxo é INDEPENDENTE do login local (`MemberAuthService.loginByCpf`,
 * tela principal do totem): aluno local consulta só a tabela `Member` local
 * e erra se não achar lá; aluno de agregado CloudGym consulta só a CloudGym
 * e erra se não achar lá. Por isso `loginCloudgym` nunca faz um lookup local
 * por CPF/matrícula pra decidir o resultado — sempre consulta a CloudGym
 * primeiro. A tabela `Member` local só entra depois, como destino do cache
 * (a sessão do cliente precisa de um `memberId` interno pra funcionar), nunca
 * como atalho pra pular a chamada à CloudGym.
 */
@Injectable()
export class AggregatorLoginService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly memberAuthService: MemberAuthService,
		private readonly cloudgymClient: CloudgymClientService,
	) {}

	async login(
		companyId: string,
		deviceId: string,
		provider: AggregatorProvider,
		token: string,
	) {
		if (provider === AggregatorProvider.CLOUDGYM) {
			return this.loginCloudgym(companyId, deviceId, token);
		}

		throw new NotImplementedException(
			"Integração real com esse agregador ainda não configurada — pendente de credenciais do provedor.",
		);
	}

	private async loginCloudgym(companyId: string, deviceId: string, cpf: string) {
		const customer = await this.cloudgymClient.findCustomerByCpf(companyId, cpf);
		if (!customer) {
			throw new NotFoundException(
				"CPF não encontrado na CloudGym. Confira o CPF ou fale com a recepção.",
			);
		}

		const data = {
			cpf: customer.cpf || cpf.replace(/\D/g, ""),
			name: customer.name,
			email: customer.email || undefined,
			phone: customer.cellPhoneNumber || customer.phoneNumber || undefined,
			status: CLOUDGYM_STATUS_MAP[customer.status] ?? MemberStatus.ACTIVE,
			cloudgymMemberId: customer.id,
		};

		const member = await this.prisma.member.upsert({
			where: { companyId_cloudgymMemberId: { companyId, cloudgymMemberId: customer.id } },
			create: { companyId, ...data },
			update: data,
		});

		await this.linkMember(member.id, AggregatorProvider.CLOUDGYM, String(customer.id));

		return this.memberAuthService.issueSession(
			member.id,
			companyId,
			deviceId,
			MemberEvent.LOGIN_AGGREGATOR_SUCCESS,
		);
	}

	async linkMember(
		memberId: string,
		provider: AggregatorProvider,
		externalId: string,
	) {
		return this.prisma.memberAggregatorLink.upsert({
			where: { provider_externalId: { provider, externalId } },
			create: { memberId, provider, externalId },
			update: { memberId },
		});
	}
}
