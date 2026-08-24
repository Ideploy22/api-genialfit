import {
	BadRequestException,
	Injectable,
	NotFoundException,
	NotImplementedException,
} from "@nestjs/common";
import { AggregatorProvider } from "@prisma/client";
import { PrismaService } from "@/database/prisma/prisma.service";
import type { ClientLoginDto } from "@/modules/member/dto/client-login.dto";
import { MemberAuthService } from "@/modules/member/member-auth.service";

export interface AggregatorLoginResult {
	externalId: string;
	name: string;
	isFirstAccess: boolean;
}

/**
 * Validação real do token junto à API de cada agregador (Gympass/TotalPass/
 * Wellhub) depende de credenciais/contrato próprios com cada provedor, que
 * ainda não existem neste projeto — por decisão do usuário, esses seguem só
 * com a estrutura pronta (rota, DTO, tabela MemberAggregatorLink).
 *
 * CloudGym é diferente: já tem credenciais reais (CloudgymIntegration), mas
 * a API dela não expõe busca de cliente por CPF nem validação de "token do
 * cliente" — só criação/escrita. Por isso o "token" aqui é o próprio
 * CPF/matrícula do aluno, resolvido contra o Member já sincronizado
 * localmente via webhook (cloudgymMemberId preenchido). Sem isso sincronizado
 * ainda, não tem como validar o vínculo sob demanda — é a mesma limitação
 * documentada em CloudgymClientService.
 */
@Injectable()
export class AggregatorLoginService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly memberAuthService: MemberAuthService,
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

	private async loginCloudgym(companyId: string, deviceId: string, identifier: string) {
		const member = await this.prisma.member.findFirst({
			where: { companyId, OR: [{ cpf: identifier }, { matricula: identifier }] },
		});
		if (!member) {
			throw new NotFoundException("CPF não encontrado. Confira o CPF ou fale com a recepção.");
		}
		if (member.cloudgymMemberId === null) {
			throw new BadRequestException(
				"Esse CPF ainda não está vinculado à CloudGym nesta academia. Fale com a recepção.",
			);
		}

		await this.linkMember(
			member.id,
			AggregatorProvider.CLOUDGYM,
			String(member.cloudgymMemberId),
		);

		const dto: ClientLoginDto = { identifier };
		return this.memberAuthService.loginByCpf(companyId, deviceId, dto);
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
