import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CreateDueDayOptionDto } from "./dto/create-due-day-option.dto";
import { UpdateDueDayOptionDto } from "./dto/update-due-day-option.dto";
import { DueDayOptionEntity } from "./entities/due-day-option.entity";

@Injectable()
export class DueDayOptionService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateDueDayOptionDto) {
		const existing = await this.prisma.dueDayOption.findUnique({
			where: { companyId_day: { companyId: dto.companyId, day: dto.day } },
		});
		if (existing) {
			throw new ConflictException("Essa empresa já tem esse dia de vencimento cadastrado.");
		}

		return this.prisma.dueDayOption.create({ data: dto });
	}

	/** Lista crua (ativas e inativas) — alimenta a tela de admin. */
	findByCompanyAdmin(companyId: string) {
		return this.prisma.dueDayOption.findMany({
			where: { companyId },
			orderBy: { order: "asc" },
		});
	}

	/** Dias de vencimento disponíveis no totem — só os ativos. */
	async findActiveForCompany(companyId: string): Promise<DueDayOptionEntity[]> {
		const options = await this.prisma.dueDayOption.findMany({
			where: { companyId, active: true },
			orderBy: { order: "asc" },
		});

		return options.map((option) => ({
			id: option.id,
			day: option.day,
			order: option.order,
		}));
	}

	/** Usado pelo MemberService pra validar a escolha do aluno contra o que a empresa realmente oferece. */
	async isValidDayForCompany(companyId: string, day: number): Promise<boolean> {
		const option = await this.prisma.dueDayOption.findFirst({
			where: { companyId, day, active: true },
		});
		return option !== null;
	}

	async findOne(id: string) {
		const item = await this.prisma.dueDayOption.findUnique({ where: { id } });
		if (!item) throw new NotFoundException("Dia de vencimento não encontrado.");
		return item;
	}

	async update(id: string, dto: UpdateDueDayOptionDto) {
		await this.findOne(id);
		return this.prisma.dueDayOption.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.dueDayOption.delete({ where: { id } });
	}
}
