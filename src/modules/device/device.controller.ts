import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { ApiPaginatedResponse } from "@/common/decorators/api-paginated-response.decorator";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";
import { PageOptionsDto } from "@/common/dto/page-options.dto";
import { DeviceService } from "./device.service";
import { ActionDeviceDto } from "./dto/action-device.dto";
import { RegisterDeviceDto } from "./dto/register-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import { DeviceEntity, DeviceLogEntity } from "./entities/device.entity";

@ApiTags("Devices")
@Controller("device")
export class DeviceController {
	constructor(private readonly deviceService: DeviceService) {}

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

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Patch(":id")
	@ApiOperation({ summary: "Atualizar nome amigável ou versão do app" })
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
	approve(@Param("id") id: string, @Body() dto: ActionDeviceDto) {
		// TODO: extrair userId do JWT quando decorator userLogged estiver disponível
		return this.deviceService.approve(id, dto, "system");
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post(":id/block")
	@ApiOperation({
		summary: "Bloquear dispositivo",
		description: "Revoga todas as sessões ativas e bloqueia o device.",
	})
	@ApiResponse({ status: 200, type: DeviceEntity })
	block(@Param("id") id: string, @Body() dto: ActionDeviceDto) {
		return this.deviceService.block(id, dto, "system");
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post(":id/unblock")
	@ApiOperation({
		summary: "Desbloquear dispositivo",
		description: "Reativa dispositivo bloqueado para APPROVED.",
	})
	@ApiResponse({ status: 200, type: DeviceEntity })
	unblock(@Param("id") id: string, @Body() dto: ActionDeviceDto) {
		return this.deviceService.unblock(id, dto, "system");
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post(":id/revoke")
	@ApiOperation({
		summary: "Revogar dispositivo",
		description: "Revogação permanente. Revoga todas as sessões ativas.",
	})
	@ApiResponse({ status: 200, type: DeviceEntity })
	revoke(@Param("id") id: string, @Body() dto: ActionDeviceDto) {
		return this.deviceService.revoke(id, dto, "system");
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
