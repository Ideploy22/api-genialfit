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
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto";
import { PaymentMethodEntity } from "./entities/payment-method.entity";
import { PaymentMethodService } from "./payment-method.service";

@ApiTags("PaymentMethod")
@Controller("payment-method")
export class PaymentMethodController {
	constructor(private readonly service: PaymentMethodService) {}

	// ── Totem ────────────────────────────────────────────────────────────────

	@UseGuards(DeviceJwtGuard)
	@ApiBearerAuth()
	@Get()
	@ApiOperation({ summary: "Listar formas de pagamento ativas da empresa (totem)" })
	@ApiResponse({ status: 200, type: [PaymentMethodEntity] })
	findAll(@DeviceLogged() device: PropsDeviceLogado) {
		return this.service.findActiveForCompany(device.companyId as string);
	}

	// ── Admin (web-genialfit) ────────────────────────────────────────────────

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get("company/:companyId")
	@ApiOperation({ summary: "Listar todas as formas de pagamento (ativas e inativas) de uma empresa" })
	findByCompany(@Param("companyId") companyId: string) {
		return this.service.findByCompanyAdmin(companyId);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post()
	@ApiOperation({ summary: "Cadastrar forma de pagamento" })
	create(@Body() dto: CreatePaymentMethodDto) {
		return this.service.create(dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Patch(":id")
	@ApiOperation({ summary: "Atualizar forma de pagamento (ativar/desativar, ordem, config do pinpad)" })
	update(@Param("id") id: string, @Body() dto: UpdatePaymentMethodDto) {
		return this.service.update(id, dto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Delete(":id")
	@ApiOperation({ summary: "Remover forma de pagamento" })
	remove(@Param("id") id: string) {
		return this.service.remove(id);
	}
}
