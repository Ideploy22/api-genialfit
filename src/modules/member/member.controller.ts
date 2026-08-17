import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { ClientJwtGuard } from "@/auth/client-jwt.guard";
import { DeviceJwtGuard } from "@/auth/device-jwt.guard";
import { DeviceLogged } from "@/common/decorators/device-logged.decorator";
import { MemberLogged } from "@/common/decorators/member-logged.decorator";
import type { PropsDeviceLogado, PropsMemberLogado } from "@/types";
import { ChangeDueDateDto } from "./dto/change-due-date.dto";
import { ClientLoginDto } from "./dto/client-login.dto";
import { ClientQrLoginDto } from "./dto/client-qr-login.dto";
import { PayInvoiceDto } from "./dto/pay-invoice.dto";
import { RegisterMemberDto } from "./dto/register-member.dto";
import { MemberProfileEntity } from "./entities/member.entity";
import { MemberService } from "./member.service";
import { MemberAuthService } from "./member-auth.service";

/**
 * As rotas de login/cadastro exigem o totem autenticado (DeviceJwtGuard) —
 * é ele quem dá o companyId, ainda sem cliente logado. As rotas /me/* já
 * têm um cliente logado e exigem só a sessão dele (ClientJwtGuard) — os dois
 * guards não se combinam (o token do cliente não é um token de device), por
 * isso NÃO ficam num @UseGuards de classe: cada rota declara o guard certo.
 */
@ApiTags("Member (totem)")
@ApiBearerAuth()
@Controller("member")
export class MemberController {
	constructor(
		private readonly memberAuthService: MemberAuthService,
		private readonly memberService: MemberService,
	) {}

	@UseGuards(DeviceJwtGuard)
	@Post("auth/cpf")
	@ApiOperation({ summary: "Login do cliente por CPF ou matrícula" })
	loginByCpf(
		@Body() dto: ClientLoginDto,
		@DeviceLogged() device: PropsDeviceLogado,
	) {
		return this.memberAuthService.loginByCpf(
			device.companyId as string,
			device.deviceId,
			dto,
		);
	}

	@UseGuards(DeviceJwtGuard)
	@Post("auth/qrcode")
	@ApiOperation({ summary: "Login do cliente por QR Code" })
	loginByQrCode(
		@Body() dto: ClientQrLoginDto,
		@DeviceLogged() device: PropsDeviceLogado,
	) {
		return this.memberAuthService.loginByQrCode(
			device.companyId as string,
			device.deviceId,
			dto,
		);
	}

	@UseGuards(DeviceJwtGuard)
	@Post("register")
	@ApiOperation({
		summary: "Cadastro de novo cliente (wizard do totem)",
		description:
			"Cria o membro na CloudGym (POST /customer, com plano já incluso) e localmente; devolve sessão já autenticada.",
	})
	register(
		@Body() dto: RegisterMemberDto,
		@DeviceLogged() device: PropsDeviceLogado,
	) {
		return this.memberAuthService.register(
			device.companyId as string,
			device.deviceId,
			dto,
		);
	}

	@UseGuards(ClientJwtGuard)
	@Get("me")
	@ApiOperation({ summary: "Perfil do cliente logado" })
	@ApiResponse({ status: 200, type: MemberProfileEntity })
	me(@MemberLogged() member: PropsMemberLogado) {
		return this.memberService.getProfile(member.memberId);
	}

	@UseGuards(ClientJwtGuard)
	@Get("me/workout/today")
	@ApiOperation({ summary: "Treino de hoje do cliente logado" })
	workoutToday(@MemberLogged() member: PropsMemberLogado) {
		return this.memberService.getWorkoutToday(
			member.memberId,
			member.companyId,
		);
	}

	@UseGuards(ClientJwtGuard)
	@Post("me/workout/:exerciseRef/complete")
	@ApiOperation({ summary: "Marcar exercício como concluído" })
	completeWorkout(
		@Param("exerciseRef") exerciseRef: string,
		@MemberLogged() member: PropsMemberLogado,
	) {
		return this.memberService.completeWorkoutExercise(
			member.memberId,
			exerciseRef,
		);
	}

	@UseGuards(ClientJwtGuard)
	@Get("me/invoices")
	@ApiOperation({ summary: "Faturas do cliente logado" })
	invoices(@MemberLogged() member: PropsMemberLogado) {
		return this.memberService.getInvoices(member.memberId);
	}

	@UseGuards(ClientJwtGuard)
	@Post("me/invoices/:id/pay")
	@ApiOperation({ summary: "Pagar fatura" })
	payInvoice(
		@Param("id") id: string,
		@Body() dto: PayInvoiceDto,
		@MemberLogged() member: PropsMemberLogado,
	) {
		return this.memberService.payInvoice(
			member.memberId,
			member.companyId,
			id,
			dto,
		);
	}

	@UseGuards(ClientJwtGuard)
	@Post("me/invoices/confirm/:tid")
	@ApiOperation({ summary: "Confirmar pagamento (retorno de checkout)" })
	confirmPayment(
		@Param("tid") tid: string,
		@MemberLogged() member: PropsMemberLogado,
	) {
		return this.memberService.confirmPayment(member.companyId, tid);
	}

	@UseGuards(ClientJwtGuard)
	@Patch("me/contract/due-date")
	@ApiOperation({ summary: "Alterar dia de vencimento do contrato ativo" })
	changeDueDate(
		@Body() dto: ChangeDueDateDto,
		@MemberLogged() member: PropsMemberLogado,
	) {
		return this.memberService.changeDueDate(
			member.memberId,
			member.companyId,
			dto.newDueDay,
		);
	}
}
