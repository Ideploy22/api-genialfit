import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { DeviceJwtGuard } from "@/auth/device-jwt.guard";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { DeviceLogged } from "@/common/decorators/device-logged.decorator";
import type { PropsDeviceLogado } from "@/types";
import { BannerService } from "./banner.service";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { BannerEntity } from "./entities/banner.entity";

@ApiTags("Banner")
@Controller("banner")
export class BannerController {
	constructor(private readonly service: BannerService) {}

	// ── Totem ────────────────────────────────────────────────────────────────

	@UseGuards(DeviceJwtGuard)
	@ApiBearerAuth()
	@Get()
	@ApiOperation({ summary: "Listar banners ativos da empresa (tela inicial do totem)" })
	@ApiResponse({ status: 200, type: [BannerEntity] })
	findAll(@DeviceLogged() device: PropsDeviceLogado) {
		return this.service.findActiveForCompany(device.companyId as string);
	}

	// ── Admin (web-genialfit) ────────────────────────────────────────────────

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get("company/:companyId")
	@ApiOperation({ summary: "Listar todos os banners (ativos e inativos) de uma empresa" })
	findByCompany(@Param("companyId") companyId: string) {
		return this.service.findByCompanyAdmin(companyId);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post()
	@ApiOperation({ summary: "Criar banner", description: "Só os dados — a imagem é enviada depois em POST /banner/:id/image." })
	create(@Body() dto: CreateBannerDto) {
		return this.service.create(dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post(":id/image")
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: { type: "object", properties: { file: { type: "string", format: "binary" } } },
	})
	@ApiOperation({ summary: "Upload/substituição da imagem do banner" })
	async uploadImage(@Param("id") id: string, @Req() req: FastifyRequest) {
		const file = await req.file();
		if (!file) throw new BadRequestException("Arquivo não enviado.");
		return this.service.uploadImage(id, file);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Patch(":id")
	@ApiOperation({ summary: "Atualizar banner" })
	update(@Param("id") id: string, @Body() dto: UpdateBannerDto) {
		return this.service.update(id, dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Delete(":id")
	@ApiOperation({ summary: "Remover banner" })
	remove(@Param("id") id: string) {
		return this.service.remove(id);
	}
}
