import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { DeviceJwtGuard } from "@/auth/device-jwt.guard";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { ApiPaginatedResponse } from "@/common/decorators/api-paginated-response.decorator";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";
import { DeviceLogged } from "@/common/decorators/device-logged.decorator";
import { UserLogged } from "@/common/decorators/user-logged.decorator";
import { PageOptionsDto } from "@/common/dto/page-options.dto";
import type { PropsDeviceLogado, PropsUserLogado } from "@/types";
import { DeviceService } from "./device.service";
import { DeviceAuthService } from "./device-auth.service";
import { ActionDeviceDto } from "./dto/action-device.dto";
import { LoginDeviceDto } from "./dto/login-device.dto";
import { RefreshDeviceDto } from "./dto/refresh-device.dto";
import { RegisterDeviceDto } from "./dto/register-device.dto";
import { RevokeSelfDeviceDto } from "./dto/revoke-self-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import { DeviceEntity, DeviceLogEntity } from "./entities/device.entity";

@ApiTags("Devices")
@Controller("device")
export class DeviceController {
	constructor(
		private readonly deviceService: DeviceService,
		private readonly deviceAuthService: DeviceAuthService,
	) {}

	// ── Público — chamado pelo Electron ─────────────────────────────────────

	@Post("register")
	@ApiOperation({
		summary: "Registrar dispositivo",
		description:
			"Chamado pelo Electron na primeira execução. Cria o device com status PENDING.",
	})
	@ApiResponse({ status: 201, type: DeviceEntity })
	register(@Body() dto: RegisterDeviceDto) {
		return this.deviceService.register(dto);
	}

	@Get(":id/status")
	@ApiOperation({
		summary: "Consultar status do dispositivo",
		description:
			"Pública — usada pelo próprio totem (painel /admin local) para saber se já foi aprovado, sem precisar de sessão de admin.",
	})
	@ApiResponse({ status: 200, schema: { example: { status: "APPROVED" } } })
	status(@Param("id") id: string) {
		return this.deviceService.getStatus(id);
	}

	@Post("auth/login")
	@ApiOperation({
		summary: "Autenticar dispositivo",
		description:
			"Valida deviceId + deviceSecret e retorna access/refresh token.",
	})
	@ApiResponse({
		status: 200,
		schema: {
			example: { accessToken: "...", refreshToken: "...", expiresIn: "15m" },
		},
	})
	login(@Body() dto: LoginDeviceDto, @Req() req: FastifyRequest) {
		return this.deviceAuthService.login(dto, req.ip, req.headers["user-agent"]);
	}

	@Post("auth/refresh")
	@ApiOperation({
		summary: "Renovar token",
		description: "Rotaciona o refresh token e emite novo access token.",
	})
	@ApiResponse({
		status: 200,
		schema: {
			example: { accessToken: "...", refreshToken: "...", expiresIn: "15m" },
		},
	})
	refresh(@Body() dto: RefreshDeviceDto, @Req() req: FastifyRequest) {
		return this.deviceAuthService.refresh(
			dto,
			req.ip,
			req.headers["user-agent"],
		);
	}

	@UseGuards(DeviceJwtGuard)
	@ApiBearerAuth()
	@Post("auth/heartbeat")
	@ApiOperation({
		summary: "Heartbeat",
		description: "Sinaliza que o dispositivo está online. Atualiza lastSeen.",
	})
	heartbeat(
		@DeviceLogged() device: PropsDeviceLogado,
		@Req() req: FastifyRequest,
	) {
		return this.deviceAuthService.heartbeat(device.deviceId, req.ip);
	}

	@Post(":id/revoke-self")
	@ApiOperation({
		summary: "Dispositivo se revogar",
		description:
			"Chamado pelo próprio totem ao 'Resetar totem' (troca de academia). Sem sessão de " +
			"admin disponível ali, então autentica com o deviceSecret (device.json) em vez de " +
			"JWT — não faz sentido o token de um totem resetado continuar válido pra sempre.",
	})
	@ApiResponse({ status: 200, type: DeviceEntity })
	revokeSelf(@Param("id") id: string, @Body() dto: RevokeSelfDeviceDto) {
		return this.deviceService.revokeSelf(id, dto.deviceSecret);
	}

	// ── Rotas administrativas ────────────────────────────────────────────────

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get()
	@ApiOperation({ summary: "Listar dispositivos" })
	@ApiPaginatedResponse(DeviceEntity)
	@ApiStandardResponse({ path: "/device" })
	findAll(@Query() pageOptionsDto: PageOptionsDto) {
		return this.deviceService.findAll(pageOptionsDto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get(":id")
	@ApiOperation({ summary: "Buscar dispositivo por id" })
	@ApiResponse({ status: 200, type: DeviceEntity })
	@ApiStandardResponse({ path: "/device/:id" })
	findOne(@Param("id") id: string) {
		return this.deviceService.findOne(id);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get(":id/logs")
	@ApiOperation({ summary: "Histórico de eventos do dispositivo" })
	@ApiPaginatedResponse(DeviceLogEntity)
	@ApiStandardResponse({ path: "/device/:id/logs" })
	findLogs(@Param("id") id: string, @Query() pageOptionsDto: PageOptionsDto) {
		return this.deviceService.findLogs(id, pageOptionsDto);
	}

	// Sem guard de propósito: usada tanto pelo admin (displayName, via painel
	// web autenticado por fora) quanto pelo próprio totem sem sessão de admin
	// (appVersion, reportado a cada boot — ver __root.tsx no totem). Os dois
	// casos preenchem campos diferentes do mesmo DTO, então não dá pra exigir
	// JwtAuthGuard sem quebrar o totem.
	@ApiBearerAuth()
	@Patch(":id")
	@ApiOperation({ summary: "Atualizar nome amigável (admin) ou versão do app (totem)" })
	@ApiResponse({ status: 200, type: DeviceEntity })
	@ApiStandardResponse({ path: "/device/:id" })
	update(@Param("id") id: string, @Body() dto: UpdateDeviceDto) {
		return this.deviceService.update(id, dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post(":id/approve")
	@ApiOperation({
		summary: "Aprovar dispositivo",
		description: "Muda status de PENDING para APPROVED.",
	})
	@ApiResponse({ status: 200, type: DeviceEntity })
	approve(
		@Param("id") id: string,
		@Body() dto: ActionDeviceDto,
		@UserLogged() user: PropsUserLogado,
	) {
		return this.deviceService.approve(id, dto, user.name);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post(":id/block")
	@ApiOperation({
		summary: "Bloquear dispositivo",
		description: "Revoga todas as sessões ativas e bloqueia o device.",
	})
	@ApiResponse({ status: 200, type: DeviceEntity })
	block(
		@Param("id") id: string,
		@Body() dto: ActionDeviceDto,
		@UserLogged() user: PropsUserLogado,
	) {
		return this.deviceService.block(id, dto, user.name);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post(":id/unblock")
	@ApiOperation({
		summary: "Desbloquear dispositivo",
		description: "Reativa dispositivo bloqueado para APPROVED.",
	})
	@ApiResponse({ status: 200, type: DeviceEntity })
	unblock(
		@Param("id") id: string,
		@Body() dto: ActionDeviceDto,
		@UserLogged() user: PropsUserLogado,
	) {
		return this.deviceService.unblock(id, dto, user.name);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post(":id/revoke")
	@ApiOperation({
		summary: "Revogar dispositivo",
		description: "Revogação permanente. Revoga todas as sessões ativas.",
	})
	@ApiResponse({ status: 200, type: DeviceEntity })
	revoke(
		@Param("id") id: string,
		@Body() dto: ActionDeviceDto,
		@UserLogged() user: PropsUserLogado,
	) {
		return this.deviceService.revoke(id, dto, user.name);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Delete(":id")
	@ApiOperation({ summary: "Remover dispositivo" })
	@ApiStandardResponse({ path: "/device/:id" })
	remove(@Param("id") id: string) {
		return this.deviceService.remove(id);
	}
}
