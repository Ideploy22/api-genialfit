import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto";
import { PaymentMethodEntity } from "./entities/payment-method.entity";

@Injectable()
export class PaymentMethodService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreatePaymentMethodDto) {
		const existing = await this.prisma.paymentMethodConfig.findUnique({
			where: { companyId_type: { companyId: dto.companyId, type: dto.type } },
		});
		if (existing) {
			throw new ConflictException("Essa empresa já tem essa forma de pagamento cadastrada.");
		}

		return this.prisma.paymentMethodConfig.create({ data: dto });
	}

	/** Lista crua (ativas e inativas) — alimenta a tela de admin. */
	findByCompanyAdmin(companyId: string) {
		return this.prisma.paymentMethodConfig.findMany({
			where: { companyId },
			orderBy: { order: "asc" },
		});
	}

	/** Formas de pagamento disponíveis no totem — só as ativas, sem os campos de config do pinpad. */
	async findActiveForCompany(companyId: string): Promise<PaymentMethodEntity[]> {
		const methods = await this.prisma.paymentMethodConfig.findMany({
			where: { companyId, active: true },
			orderBy: { order: "asc" },
		});

		return methods.map((method) => ({
			id: method.id,
			type: method.type,
			order: method.order,
		}));
	}

	async findOne(id: string) {
		const item = await this.prisma.paymentMethodConfig.findUnique({ where: { id } });
		if (!item) throw new NotFoundException("Forma de pagamento não encontrada.");
		return item;
	}

	async update(id: string, dto: UpdatePaymentMethodDto) {
		await this.findOne(id);
		return this.prisma.paymentMethodConfig.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.paymentMethodConfig.delete({ where: { id } });
	}
}
