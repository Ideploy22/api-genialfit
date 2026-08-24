import {
	BadRequestException,
	Body,
	Controller,
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
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { ClientJwtGuard } from "@/auth/client-jwt.guard";
import { DeviceJwtGuard } from "@/auth/device-jwt.guard";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { DeviceLogged } from "@/common/decorators/device-logged.decorator";
import { MemberLogged } from "@/common/decorators/member-logged.decorator";
import type { PropsDeviceLogado, PropsMemberLogado } from "@/types";
import { ChangeDueDateDto } from "./dto/change-due-date.dto";
import { ClientLoginDto } from "./dto/client-login.dto";
import { ClientQrLoginDto } from "./dto/client-qr-login.dto";
import { MarkInvoicePaidDto } from "./dto/mark-invoice-paid.dto";
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

	// ── Admin (web-genialfit) ────────────────────────────────────────────────

	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiOperation({ summary: "Listar clientes de uma empresa" })
	@ApiQuery({ name: "companyId", required: true })
	findByCompany(@Query("companyId") companyId: string) {
		return this.memberService.findByCompany(companyId);
	}

	// ── Totem ────────────────────────────────────────────────────────────────

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
		description: "Cria o membro localmente (planId de um PlanContent); devolve sessão já autenticada.",
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
	@Post("me/avatar")
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: { type: "object", properties: { file: { type: "string", format: "binary" } } },
	})
	@ApiOperation({
		summary: "Upload da foto de perfil (câmera do totem)",
		description:
			"Chamado logo após POST /member/register (mesmo padrão do banner: cadastro só com dados, imagem enviada depois).",
	})
	async uploadAvatar(
		@Req() req: FastifyRequest,
		@MemberLogged() member: PropsMemberLogado,
	) {
		const file = await req.file();
		if (!file) throw new BadRequestException("Arquivo não enviado.");
		return this.memberService.uploadAvatar(member.memberId, file);
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
		return this.memberService.payInvoice(member.memberId, id, dto);
	}

	@UseGuards(ClientJwtGuard)
	@Patch("me/contract/due-date")
	@ApiOperation({ summary: "Alterar dia de vencimento do contrato ativo" })
	changeDueDate(
		@Body() dto: ChangeDueDateDto,
		@MemberLogged() member: PropsMemberLogado,
	) {
		return this.memberService.changeDueDate(member.memberId, member.companyId, dto.newDueDay);
	}

	// ── Admin (web-genialfit) — detalhe de um cliente ───────────────────────────

	@UseGuards(JwtAuthGuard)
	@Get(":id")
	@ApiOperation({ summary: "Detalhe de um cliente (admin)" })
	@ApiQuery({ name: "companyId", required: true })
	findOne(@Param("id") id: string, @Query("companyId") companyId: string) {
		return this.memberService.findOneForCompany(companyId, id);
	}

	@UseGuards(JwtAuthGuard)
	@Get(":id/invoices")
	@ApiOperation({ summary: "Faturas de um cliente (admin)" })
	@ApiQuery({ name: "companyId", required: true })
	invoicesForAdmin(@Param("id") id: string, @Query("companyId") companyId: string) {
		return this.memberService.getInvoicesForCompany(companyId, id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(":id/invoices/:invoiceId/mark-paid")
	@ApiOperation({ summary: "Marcar fatura como paga manualmente (admin)" })
	@ApiQuery({ name: "companyId", required: true })
	markInvoicePaid(
		@Param("id") id: string,
		@Param("invoiceId") invoiceId: string,
		@Query("companyId") companyId: string,
		@Body() dto: MarkInvoicePaidDto,
	) {
		return this.memberService.markInvoicePaidByAdmin(
			companyId,
			id,
			invoiceId,
			dto.methodPayment,
		);
	}
}
