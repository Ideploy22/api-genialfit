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
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { DeviceJwtGuard } from "@/auth/device-jwt.guard";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { DeviceLogged } from "@/common/decorators/device-logged.decorator";
import type { PropsDeviceLogado } from "@/types";
import { CreatePlanContentDto } from "./dto/create-plan-content.dto";
import { UpdatePlanContentDto } from "./dto/update-plan-content.dto";
import { PlanEntity } from "./entities/plan.entity";
import { PlanService } from "./plan.service";

@ApiTags("Plan")
@Controller("plan")
export class PlanController {
	constructor(private readonly service: PlanService) {}

	// ── Totem ────────────────────────────────────────────────────────────────

	@UseGuards(DeviceJwtGuard)
	@ApiBearerAuth()
	@Get()
	@ApiOperation({
		summary: "Listar planos disponíveis",
		description:
			"Preço/regras ao vivo da CloudGym + conteúdo de marketing local.",
	})
	@ApiResponse({ status: 200, type: [PlanEntity] })
	findAll(@DeviceLogged() device: PropsDeviceLogado) {
		return this.service.findAllForCompany(device.companyId as string);
	}

	// ── Admin (web-genialfit) ────────────────────────────────────────────────

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get("content")
	@ApiOperation({
		summary: "Listar planos (locais e vinculados à CloudGym) de uma empresa",
	})
	@ApiQuery({ name: "companyId", required: true })
	@ApiResponse({ status: 200 })
	findContent(@Query("companyId") companyId: string) {
		return this.service.findContentByCompany(companyId);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post("content")
	@ApiOperation({
		summary: "Criar conteúdo de marketing para um plano CloudGym",
	})
	create(@Body() dto: CreatePlanContentDto) {
		return this.service.create(dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Patch("content/:id")
	@ApiOperation({ summary: "Atualizar conteúdo de marketing de um plano" })
	update(@Param("id") id: string, @Body() dto: UpdatePlanContentDto) {
		return this.service.update(id, dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Delete("content/:id")
	@ApiOperation({ summary: "Remover conteúdo de marketing de um plano" })
	remove(@Param("id") id: string) {
		return this.service.remove(id);
	}
}
