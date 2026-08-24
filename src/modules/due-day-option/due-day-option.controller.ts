import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DeviceJwtGuard } from "@/auth/device-jwt.guard";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { DeviceLogged } from "@/common/decorators/device-logged.decorator";
import type { PropsDeviceLogado } from "@/types";
import { CreateDueDayOptionDto } from "./dto/create-due-day-option.dto";
import { UpdateDueDayOptionDto } from "./dto/update-due-day-option.dto";
import { DueDayOptionEntity } from "./entities/due-day-option.entity";
import { DueDayOptionService } from "./due-day-option.service";

@ApiTags("DueDayOption")
@Controller("due-day-option")
export class DueDayOptionController {
	constructor(private readonly service: DueDayOptionService) {}

	// ── Totem ────────────────────────────────────────────────────────────────

	@UseGuards(DeviceJwtGuard)
	@ApiBearerAuth()
	@Get()
	@ApiOperation({ summary: "Listar dias de vencimento ativos da empresa (totem)" })
	@ApiResponse({ status: 200, type: [DueDayOptionEntity] })
	findAll(@DeviceLogged() device: PropsDeviceLogado) {
		return this.service.findActiveForCompany(device.companyId as string);
	}

	// ── Admin (web-genialfit) ────────────────────────────────────────────────

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get("company/:companyId")
	@ApiOperation({ summary: "Listar todos os dias de vencimento (ativos e inativos) de uma empresa" })
	findByCompany(@Param("companyId") companyId: string) {
		return this.service.findByCompanyAdmin(companyId);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post()
	@ApiOperation({ summary: "Cadastrar dia de vencimento" })
	create(@Body() dto: CreateDueDayOptionDto) {
		return this.service.create(dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Patch(":id")
	@ApiOperation({ summary: "Atualizar dia de vencimento (ativar/desativar, ordem)" })
	update(@Param("id") id: string, @Body() dto: UpdateDueDayOptionDto) {
		return this.service.update(id, dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Delete(":id")
	@ApiOperation({ summary: "Remover dia de vencimento" })
	remove(@Param("id") id: string) {
		return this.service.remove(id);
	}
}
