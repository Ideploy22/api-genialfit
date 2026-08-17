import type { MultipartFile } from "@fastify/multipart";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { s3 } from "@/common/s3";
import { PageDto } from "@/common/dto/page.dto";
import { PageMetaDto } from "@/common/dto/page-meta.dto";
import { PageOptionsDto } from "@/common/dto/page-options.dto";
import { PrismaService } from "@/database/prisma/prisma.service";
import { mediaUrl } from "@/modules/midias/midias.utils";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

const includeColors = { colorCompany: true } as const;
/** Subpasta no bucket S3 onde ficam os logos (normal e negativo) das empresas. */
const LOGO_SUB = "empresas";

@Injectable()
export class CompanyService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateCompanyDto) {
		const { colorCompany, ...rest } = dto;
		const company = await this.prisma.company.create({
			data: {
				...rest,
				...(colorCompany && { colorCompany: { create: colorCompany } }),
			},
			include: includeColors,
		});
		return this.mapLogos(company);
	}

	/**
	 * Envia o logo (normal ou negativo) da empresa pro S3 e salva a key no
	 * banco. Substitui + remove o arquivo antigo do bucket, se houver — o
	 * banco guarda só a key (ex.: "uuid.png"), a URL servível é montada em
	 * `mapLogos` na hora de responder.
	 */
	async uploadLogo(id: string, file: MultipartFile, negative: boolean) {
		const existing = await this.prisma.company.findUnique({ where: { id } });
		if (!existing) throw new NotFoundException("Empresa não encontrada");

		const buffer = await file.toBuffer();
		const webFile = new File([new Uint8Array(buffer)], file.filename, {
			type: file.mimetype,
		});
		const key = await s3().post(webFile, LOGO_SUB);

		const oldKey = negative ? existing.logoNegative : existing.logo;
		if (oldKey) {
			await s3()
				.del(oldKey, LOGO_SUB)
				.catch(() => null);
		}

		const updated = await this.prisma.company.update({
			where: { id },
			data: negative ? { logoNegative: key } : { logo: key },
			include: includeColors,
		});
		return this.mapLogos(updated);
	}

	private mapLogos<T extends { logo: string | null; logoNegative: string | null }>(
		company: T,
	): T {
		return {
			...company,
			logo: company.logo ? mediaUrl(company.logo, LOGO_SUB) : null,
			logoNegative: company.logoNegative
				? mediaUrl(company.logoNegative, LOGO_SUB)
				: null,
		};
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
		return new PageDto(items.map((item) => this.mapLogos(item)), pageMetaDto);
	}

	async findOne(id: string) {
		const item = await this.prisma.company.findUnique({
			where: { id },
			include: includeColors,
		});
		if (!item) throw new NotFoundException("Empresa não encontrada");
		return this.mapLogos(item);
	}

	async findByUnicName(unicName: string) {
		const item = await this.prisma.company.findUnique({
			where: { unicName },
			include: includeColors,
		});
		if (!item) throw new NotFoundException("Empresa não encontrada");
		return this.mapLogos(item);
	}

	async update(id: string, dto: UpdateCompanyDto) {
		await this.findOne(id);
		const { colorCompany, ...rest } = dto;
		const updated = await this.prisma.company.update({
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
		return this.mapLogos(updated);
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.prisma.company.delete({ where: { id } });
	}
}
