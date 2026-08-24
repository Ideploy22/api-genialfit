import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CreatePlanContentDto } from "./dto/create-plan-content.dto";
import { UpdatePlanContentDto } from "./dto/update-plan-content.dto";
import { PlanEntity } from "./entities/plan.entity";

@Injectable()
export class PlanService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Catálogo de planos de uma empresa é sempre 100% local (PlanContent,
	 * `cloudgymPlanId` nulo) — a empresa não depende de nenhum provedor
	 * externo pra vender seus planos. CloudGym (e outros agregadores) entram
	 * por aluno, opcionalmente, depois do cadastro — não mudam o catálogo.
	 */
	async findAllForCompany(companyId: string): Promise<PlanEntity[]> {
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
