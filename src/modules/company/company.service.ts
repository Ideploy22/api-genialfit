import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PageDto } from "@/common/dto/page.dto";
import { PageMetaDto } from "@/common/dto/page-meta.dto";
import { PageOptionsDto } from "@/common/dto/page-options.dto";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

const includeColors = { colorCompany: true } as const;

@Injectable()
export class CompanyService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateCompanyDto) {
		const { colorCompany, ...rest } = dto;
		return this.prisma.company.create({
			data: {
				...rest,
				...(colorCompany && { colorCompany: { create: colorCompany } }),
			},
			include: includeColors,
		});
	}

	async findAll(pageOptionsDto: PageOptionsDto) {
		const where: Prisma.CompanyWhereInput = {};
		const allowedFields = ["name", "cnpj", "cpf", "unicName"];

		if (pageOptionsDto.search) {
			if (!allowedFields.includes(pageOptionsDto.search.field)) {
				throw new BadRequestException(
					`Campo inválido: "${pageOptionsDto.search.field}". Campos permitidos: ${allowedFields.join(", ")}`,
				);
			}
			where[pageOptionsDto.search.field] = {
				contains: pageOptionsDto.search.value,
				mode: "insensitive",
			};
		}

		const [items, itemCount] = await Promise.all([
			this.prisma.company.findMany({
				where,
				include: includeColors,
				skip: pageOptionsDto.skip,
				take: pageOptionsDto.all ? undefined : pageOptionsDto.take,
				orderBy: { createdAt: pageOptionsDto.order },
			}),
			this.prisma.company.count({ where }),
		]);

		const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
		return new PageDto(items, pageMetaDto);
	}

	async findOne(id: string) {
		const item = await this.prisma.company.findUnique({
			where: { id },
			include: includeColors,
		});
		if (!item) throw new NotFoundException("Empresa não encontrada");
		return item;
	}

	async findByUnicName(unicName: string) {
		const item = await this.prisma.company.findUnique({
			where: { unicName },
			include: includeColors,
		});
		if (!item) throw new NotFoundException("Empresa não encontrada");
		return item;
	}

	async update(id: string, dto: UpdateCompanyDto) {
		await this.findOne(id);
		const { colorCompany, ...rest } = dto;
		return this.prisma.company.update({
			where: { id },
			data: {
				...rest,
				...(colorCompany && {
					colorCompany: {
						upsert: {
							create: colorCompany,
							update: colorCompany,
						},
					},
				}),
			},
			include: includeColors,
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.prisma.company.delete({ where: { id } });
	}
}
