import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CloudgymClientService } from "@/modules/cloudgym/cloudgym-client.service";
import { CreatePlanContentDto } from "./dto/create-plan-content.dto";
import { UpdatePlanContentDto } from "./dto/update-plan-content.dto";
import { PlanEntity } from "./entities/plan.entity";

@Injectable()
export class PlanService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudgymClient: CloudgymClientService,
	) {}

	/**
	 * Com CloudgymIntegration: preço e regras vêm ao vivo da CloudGym (fonte
	 * de verdade), descrição/benefícios/destaque vêm do overlay local
	 * (PlanContent). Sem integração: catálogo é 100% local (ver
	 * findLocalPlans) — é o caso de empresas sem CloudGym configurada.
	 */
	async findAllForCompany(companyId: string): Promise<PlanEntity[]> {
		const integration = await this.prisma.cloudgymIntegration.findUnique({
			where: { companyId },
		});

		if (!integration) {
			return this.findLocalPlans(companyId);
		}

		const [cloudgymPlans, contents] = await Promise.all([
			this.cloudgymClient.getPlans(companyId, integration.unitId),
			this.prisma.planContent.findMany({
				where: { companyId, cloudgymPlanId: { not: null } },
			}),
		]);

		const contentByPlanId = new Map(contents.map((c) => [c.cloudgymPlanId, c]));

		return (cloudgymPlans.content ?? [])
			.filter((plan) => plan.id !== undefined)
			.map((plan) => {
				const content = contentByPlanId.get(plan.id as number);
				return {
					id: String(plan.id),
					namePlan: plan.name,
					descriptionPlan: content?.description ?? null,
					price: plan.price ?? 0,
					discount: content?.discount ?? undefined,
					costBenefits: content?.highlighted ?? undefined,
					services: (content?.services as string[] | undefined) ?? [],
				};
			})
			.sort((a, b) => {
				const orderA = contentByPlanId.get(Number(a.id))?.order ?? 0;
				const orderB = contentByPlanId.get(Number(b.id))?.order ?? 0;
				return orderA - orderB;
			});
	}

	/** Catálogo de uma empresa sem CloudgymIntegration — planos 100% locais. */
	private async findLocalPlans(companyId: string): Promise<PlanEntity[]> {
		const contents = await this.prisma.planContent.findMany({
			where: { companyId, cloudgymPlanId: null },
			orderBy: { order: "asc" },
		});

		return contents.map((content) => ({
			id: content.id,
			namePlan: content.name,
			descriptionPlan: content.description,
			price: content.price ? Number(content.price) : 0,
			discount: content.discount ?? undefined,
			costBenefits: content.highlighted,
			services: (content.services as string[] | undefined) ?? [],
		}));
	}

	/** Planos crus (locais e vinculados à CloudGym) de uma empresa — alimenta a tela de admin. */
	findContentByCompany(companyId: string) {
		return this.prisma.planContent.findMany({
			where: { companyId },
			orderBy: { order: "asc" },
		});
	}

	create(dto: CreatePlanContentDto) {
		if (!dto.cloudgymPlanId && dto.price === undefined) {
			throw new BadRequestException(
				"Informe price para um plano local (sem cloudgymPlanId).",
			);
		}
		return this.prisma.planContent.create({ data: dto });
	}

	async findOne(id: string) {
		const item = await this.prisma.planContent.findUnique({ where: { id } });
		if (!item) throw new NotFoundException("Conteúdo de plano não encontrado.");
		return item;
	}

	async update(id: string, dto: UpdatePlanContentDto) {
		await this.findOne(id);
		return this.prisma.planContent.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.planContent.delete({ where: { id } });
	}
}
