import { Injectable, NotImplementedException } from "@nestjs/common";
import { AggregatorProvider } from "@prisma/client";
import { PrismaService } from "@/database/prisma/prisma.service";

export interface AggregatorLoginResult {
	externalId: string;
	name: string;
	isFirstAccess: boolean;
}

/**
 * Validação real do token junto à API de cada agregador (Gympass/TotalPass/
 * Wellhub) depende de credenciais/contrato próprios com cada provedor, que
 * ainda não existem neste projeto — por decisão do usuário, esta rodada só
 * entrega a estrutura (rota, DTO, tabela MemberAggregatorLink) para o
 * frontend parar de mockar a forma da resposta. Quando as credenciais reais
 * existirem, implementar um branch por provider aqui (ex.: chamar a API do
 * Gympass) e então chamar `linkMember` com o externalId retornado.
 */
@Injectable()
export class AggregatorLoginService {
	constructor(private readonly prisma: PrismaService) {}

	async login(
		_provider: AggregatorProvider,
		_token: string,
	): Promise<AggregatorLoginResult> {
		throw new NotImplementedException(
			"Integração real com o agregador ainda não configurada — pendente de credenciais do provedor.",
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
