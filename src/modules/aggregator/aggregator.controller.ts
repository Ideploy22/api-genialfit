import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { DeviceJwtGuard } from "@/auth/device-jwt.guard";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { DeviceLogged } from "@/common/decorators/device-logged.decorator";
import type { PropsDeviceLogado } from "@/types";
import { AggregatorService } from "./aggregator.service";
import { AggregatorLoginService } from "./aggregator-login.service";
import { AggregatorLoginDto } from "./dto/aggregator-login.dto";
import { CreateAggregatorDto } from "./dto/create-aggregator.dto";
import { AggregatorEntity } from "./entities/aggregator.entity";

@ApiTags("Aggregator (Gympass/TotalPass/Wellhub)")
@Controller("aggregator")
export class AggregatorController {
	constructor(
		private readonly service: AggregatorService,
		private readonly loginService: AggregatorLoginService,
	) {}

	// ── Totem ────────────────────────────────────────────────────────────────

	@UseGuards(DeviceJwtGuard)
	@ApiBearerAuth()
	@Get()
	@ApiOperation({ summary: "Listar agregadores habilitados para a unidade" })
	@ApiResponse({ status: 200, type: [AggregatorEntity] })
	findAll(@DeviceLogged() device: PropsDeviceLogado) {
		return this.service.findEnabledForCompany(device.companyId as string);
	}

	@UseGuards(DeviceJwtGuard)
	@ApiBearerAuth()
	@Post("auth/login")
	@ApiOperation({
		summary: "Login do cliente via agregador (token)",
		description:
			"Estrutura pronta; validação real do token pendente de credenciais do provedor (ver AggregatorLoginService).",
	})
	login(@Body() dto: AggregatorLoginDto) {
		return this.loginService.login(dto.provider, dto.token);
	}

	@UseGuards(DeviceJwtGuard)
	@ApiBearerAuth()
	@Post("auth/login/qrcode")
	@ApiOperation({ summary: "Login do cliente via agregador (QR Code)" })
	loginQrCode(@Body() dto: AggregatorLoginDto) {
		return this.loginService.login(dto.provider, dto.token);
	}

	// ── Admin (web-genialfit) ────────────────────────────────────────────────

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post()
	@ApiOperation({ summary: "Habilitar agregador para uma empresa" })
	create(@Body() dto: CreateAggregatorDto) {
		return this.service.create(dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Delete(":id")
	@ApiOperation({ summary: "Desabilitar agregador" })
	remove(@Param("id") id: string) {
		return this.service.remove(id);
	}
}
