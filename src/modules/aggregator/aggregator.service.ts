import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CreateAggregatorDto } from "./dto/create-aggregator.dto";

@Injectable()
export class AggregatorService {
	constructor(private readonly prisma: PrismaService) {}

	findEnabledForCompany(companyId: string) {
		return this.prisma.aggregator.findMany({
			where: { companyId, active: true },
			select: { id: true, provider: true, active: true },
		});
	}

	create(dto: CreateAggregatorDto) {
		return this.prisma.aggregator.create({ data: dto });
	}

	async remove(id: string) {
		const item = await this.prisma.aggregator.findUnique({ where: { id } });
		if (!item) throw new NotFoundException("Agregador não encontrado.");
		await this.prisma.aggregator.delete({ where: { id } });
	}
}
