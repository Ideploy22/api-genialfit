import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { AggregatorProvider } from "@prisma/client";
import { encrypt } from "@/common/utils/crypto.helper";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CreateCloudgymIntegrationDto } from "./dto/create-cloudgym-integration.dto";
import { UpdateCloudgymIntegrationDto } from "./dto/update-cloudgym-integration.dto";

const selectSafe = {
	id: true,
	companyId: true,
	unitId: true,
	baseUrl: true,
	username: true,
	active: true,
	accessTokenExpiresAt: true,
	createdAt: true,
	updatedAt: true,
} as const;

@Injectable()
export class CloudgymIntegrationService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateCloudgymIntegrationDto) {
		const existing = await this.prisma.cloudgymIntegration.findUnique({
			where: { companyId: dto.companyId },
		});
		if (existing) {
			throw new ConflictException(
				"Esta empresa já possui uma integração CloudGym configurada.",
			);
		}

		const created = await this.prisma.cloudgymIntegration.create({
			data: {
				companyId: dto.companyId,
				unitId: dto.unitId,
				baseUrl: dto.baseUrl,
				username: dto.username,
				passwordEncrypted: encrypt(dto.password),
				webhookSecret: dto.webhookSecret ?? randomBytes(24).toString("hex"),
				active: dto.active ?? true,
			},
			select: selectSafe,
		});

		await this.syncAggregatorFlag(dto.companyId, created.active);
		return created;
	}

	async findByCompany(companyId: string) {
		const item = await this.prisma.cloudgymIntegration.findUnique({
			where: { companyId },
			select: selectSafe,
		});
		if (!item)
			throw new NotFoundException("Integração CloudGym não encontrada.");
		return item;
	}

	async update(companyId: string, dto: UpdateCloudgymIntegrationDto) {
		await this.findByCompany(companyId);

		const updated = await this.prisma.cloudgymIntegration.update({
			where: { companyId },
			data: {
				unitId: dto.unitId,
				baseUrl: dto.baseUrl,
				username: dto.username,
				...(dto.password && { passwordEncrypted: encrypt(dto.password) }),
				...(dto.webhookSecret && { webhookSecret: dto.webhookSecret }),
				active: dto.active,
				// credenciais alteradas invalidam o token em cache
				...((dto.password || dto.username) && {
					accessToken: null,
					accessTokenExpiresAt: null,
				}),
			},
			select: selectSafe,
		});

		await this.syncAggregatorFlag(companyId, updated.active);
		return updated;
	}

	async remove(companyId: string) {
		await this.findByCompany(companyId);
		await this.prisma.cloudgymIntegration.delete({ where: { companyId } });
		await this.prisma.aggregator
			.deleteMany({ where: { companyId, provider: AggregatorProvider.CLOUDGYM } })
			.catch(() => null);
	}

	/**
	 * A opção "CloudGym" só aparece pro aluno escolher no totem (tela
	 * Agregadores) se a empresa realmente tem a integração configurada e
	 * ativa — mantém o Aggregator (habilita/desabilita a opção) em sincronia
	 * com a CloudgymIntegration (credenciais), sem precisar de uma tela
	 * separada só pra isso.
	 */
	private async syncAggregatorFlag(companyId: string, active: boolean) {
		await this.prisma.aggregator.upsert({
			where: { companyId_provider: { companyId, provider: AggregatorProvider.CLOUDGYM } },
			create: { companyId, provider: AggregatorProvider.CLOUDGYM, active },
			update: { active },
		});
	}
}
