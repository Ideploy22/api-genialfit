import type { MultipartFile } from "@fastify/multipart";
import { Injectable, NotFoundException } from "@nestjs/common";
import { s3 } from "@/common/s3";
import { PrismaService } from "@/database/prisma/prisma.service";
import { mediaUrl } from "@/modules/midias/midias.utils";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { BannerEntity } from "./entities/banner.entity";

/** Subpasta no bucket S3 onde ficam as imagens dos banners. */
const BANNER_SUB = "banners";

@Injectable()
export class BannerService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateBannerDto) {
		return this.prisma.companyBanner.create({ data: dto });
	}

	/** Lista crua (ativos e inativos, com ou sem imagem) — alimenta a tela de admin. */
	findByCompanyAdmin(companyId: string) {
		return this.prisma.companyBanner
			.findMany({ where: { companyId }, orderBy: { order: "asc" } })
			.then((banners) => banners.map((banner) => this.mapImage(banner)));
	}

	/** Slides do carrossel do totem — só ativos e com imagem já enviada. */
	async findActiveForCompany(companyId: string): Promise<BannerEntity[]> {
		const banners = await this.prisma.companyBanner.findMany({
			where: { companyId, active: true, image: { not: null } },
			orderBy: { order: "asc" },
		});

		return banners.map((banner) => ({
			id: banner.id,
			title: banner.title,
			description: banner.description,
			image: mediaUrl(banner.image as string, BANNER_SUB),
		}));
	}

	async findOne(id: string) {
		const item = await this.prisma.companyBanner.findUnique({ where: { id } });
		if (!item) throw new NotFoundException("Banner não encontrado.");
		return item;
	}

	async update(id: string, dto: UpdateBannerDto) {
		await this.findOne(id);
		const updated = await this.prisma.companyBanner.update({ where: { id }, data: dto });
		return this.mapImage(updated);
	}

	async remove(id: string) {
		const item = await this.findOne(id);
		if (item.image) {
			await s3()
				.del(item.image, BANNER_SUB)
				.catch(() => null);
		}
		await this.prisma.companyBanner.delete({ where: { id } });
	}

	/** Envia/substitui a imagem do banner — mesmo padrão do logo da empresa. */
	async uploadImage(id: string, file: MultipartFile) {
		const existing = await this.findOne(id);

		const buffer = await file.toBuffer();
		const webFile = new File([new Uint8Array(buffer)], file.filename, {
			type: file.mimetype,
		});
		const key = await s3().post(webFile, BANNER_SUB);

		if (existing.image) {
			await s3()
				.del(existing.image, BANNER_SUB)
				.catch(() => null);
		}

		const updated = await this.prisma.companyBanner.update({
			where: { id },
			data: { image: key },
		});
		return this.mapImage(updated);
	}

	private mapImage<T extends { image: string | null }>(banner: T): T {
		return {
			...banner,
			image: banner.image ? mediaUrl(banner.image, BANNER_SUB) : null,
		};
	}
}
