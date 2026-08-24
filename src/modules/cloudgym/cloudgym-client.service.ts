import {
	BadGatewayException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from "@nestjs/common";
import { decrypt } from "@/common/utils/crypto.helper";
import { PrismaService } from "@/database/prisma/prisma.service";
import type {
	GetAllPlansResponse,
	GetPlanResponse,
} from "@/types/cloudgym/configuration";
import type {
	ConfirmPaymentResponse,
	CreateContractPayload,
	CreateContractResponse,
	CreateMemberPayload,
	CreateMemberResponse,
	PayInvoicesPayload,
	PayInvoicesResponse,
} from "@/types/cloudgym/customer";
import type {
	CreateWorkoutHistoryPayload,
	CreateWorkoutHistoryResponse,
	GetExerciseResponse,
	GetMemberWorkoutsResponse,
} from "@/types/cloudgym/workout";

export interface CloudgymUnitSummary {
	id: number;
	name: string;
	city: string | null;
}

/**
 * Client HTTP para a API da CloudGym (plataforma de gestão da academia).
 * Cada Company tem sua própria unidade/credenciais (ver CloudgymIntegration),
 * então toda chamada precisa do companyId para resolver token e unitId.
 *
 * A CloudGym expõe majoritariamente escrita (criar membro/contrato/fatura) e
 * poucos GETs (catálogos por unidade, histórico por memberId) — não há busca
 * de membro por CPF nem listagem de fatura por membro, por isso o cache local
 * (Member/Contract/Invoice) é alimentado via webhook, não por polling deste
 * client.
 */
@Injectable()
export class CloudgymClientService {
	private readonly logger = new Logger(CloudgymClientService.name);

	constructor(private readonly prisma: PrismaService) {}

	// ── Infra: token + fetch autenticado ────────────────────────────────────

	private async getIntegration(companyId: string) {
		const integration = await this.prisma.cloudgymIntegration.findUnique({
			where: { companyId },
		});

		if (!integration || !integration.active) {
			throw new InternalServerErrorException(
				"Integração com a CloudGym não configurada para esta empresa.",
			);
		}

		return integration;
	}

	private getBaseUrl(baseUrl: string | null): string {
		const url = baseUrl || process.env.CLOUDGYM_API_BASE_URL;
		if (!url) {
			throw new InternalServerErrorException(
				"CLOUDGYM_API_BASE_URL não configurada.",
			);
		}
		return url.replace(/\/+$/, "");
	}

	/**
	 * Garante um access token válido, buscando um novo em POST /auth/token
	 * quando ausente/expirado. Cacheia na própria linha de CloudgymIntegration.
	 *
	 * O contrato de resposta da CloudGym para /auth/token está subtipado no
	 * OpenAPI dela como `string`; na prática servidores OAuth2 "password
	 * grant" devolvem JSON `{ access_token, expires_in, ... }` — é o que este
	 * client assume. Ajustar aqui se a CloudGym confirmar outro formato.
	 */
	private async ensureAccessToken(
		integration: NonNullable<
			Awaited<ReturnType<CloudgymClientService["getIntegration"]>>
		>,
	): Promise<string> {
		const stillValid =
			integration.accessToken &&
			integration.accessTokenExpiresAt &&
			integration.accessTokenExpiresAt.getTime() - Date.now() > 30_000;

		if (stillValid) {
			return integration.accessToken as string;
		}

		const baseUrl = this.getBaseUrl(integration.baseUrl);
		const password = decrypt(integration.passwordEncrypted);
		const parsed = await this.fetchToken(integration.username, password, baseUrl);

		const expiresAt = new Date(Date.now() + parsed.expiresIn * 1000);
		await this.prisma.cloudgymIntegration.update({
			where: { id: integration.id },
			data: {
				accessToken: parsed.accessToken,
				accessTokenExpiresAt: expiresAt,
			},
		});

		return parsed.accessToken;
	}

	/** Núcleo de POST /auth/token — usado tanto pra integração já salva quanto pra descoberta de unidade (credenciais ainda não salvas). */
	private async fetchToken(
		username: string,
		password: string,
		baseUrl: string,
	): Promise<{ accessToken: string; expiresIn: number }> {
		const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

		const response = await fetch(`${baseUrl}/auth/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${basicAuth}`,
			},
			body: JSON.stringify({ grantType: "password", username, password }),
		});

		if (!response.ok) {
			this.logger.error(`Falha ao autenticar na CloudGym: ${response.status}`);
			throw new BadGatewayException(
				"Não foi possível autenticar na CloudGym — confira usuário e senha.",
			);
		}

		return this.parseTokenResponse(await response.text());
	}

	/**
	 * Autentica com usuário/senha crus (sem integração salva ainda) e lista as
	 * unidades da conta — usado pelo admin pra descobrir o unitId numérico
	 * certo antes de salvar a integração (o painel da CloudGym não deixa
	 * óbvio; o `extId` alfanumérico que aparece lá é outro campo, não serve
	 * aqui). Não persiste nada.
	 */
	async discoverUnits(
		username: string,
		password: string,
		baseUrl?: string,
	): Promise<CloudgymUnitSummary[]> {
		const resolvedBaseUrl = this.getBaseUrl(baseUrl ?? null);
		const { accessToken } = await this.fetchToken(username, password, resolvedBaseUrl);

		const response = await fetch(`${resolvedBaseUrl}/config/units`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		const raw = await response.text();

		if (!response.ok) {
			this.logger.error(`CloudGym GET /config/units -> ${response.status}: ${raw}`);
			throw new BadGatewayException(
				`Erro ao buscar unidades na CloudGym (${response.status}).`,
			);
		}

		let units: { id?: number; name?: string; trade?: string; city?: string }[];
		try {
			units = JSON.parse(raw);
		} catch {
			throw new BadGatewayException("Resposta inesperada da CloudGym ao listar unidades.");
		}

		return units
			.filter((unit): unit is typeof unit & { id: number } => unit.id !== undefined)
			.map((unit) => ({
				id: unit.id,
				name: unit.name || unit.trade || `Unidade ${unit.id}`,
				city: unit.city ?? null,
			}));
	}

	private parseTokenResponse(raw: string): {
		accessToken: string;
		expiresIn: number;
	} {
		try {
			const json = JSON.parse(raw);
			const accessToken = json.access_token ?? json.accessToken ?? json.token;
			const expiresIn = json.expires_in ?? json.expiresIn ?? 3600;
			if (!accessToken) throw new Error("access_token ausente na resposta.");
			return { accessToken, expiresIn };
		} catch {
			// Fallback: resposta veio como string crua (só o token, sem JSON).
			if (!raw) {
				throw new BadGatewayException(
					"Resposta de autenticação da CloudGym vazia ou em formato inesperado.",
				);
			}
			return { accessToken: raw.replace(/^"|"$/g, ""), expiresIn: 3600 };
		}
	}

	private async request<T>(
		companyId: string,
		path: string,
		init: { method: string; body?: unknown; query?: Record<string, string> } = {
			method: "GET",
		},
	): Promise<T> {
		const integration = await this.getIntegration(companyId);
		const accessToken = await this.ensureAccessToken(integration);
		const baseUrl = this.getBaseUrl(integration.baseUrl);

		const url = new URL(`${baseUrl}${path}`);
		for (const [key, value] of Object.entries(init.query ?? {})) {
			url.searchParams.set(key, value);
		}

		const response = await fetch(url, {
			method: init.method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
		});

		const raw = await response.text();

		if (!response.ok) {
			this.logger.error(
				`CloudGym ${init.method} ${path} -> ${response.status}: ${raw}`,
			);
			throw new BadGatewayException(
				`Erro ao comunicar com a CloudGym (${response.status}).`,
			);
		}

		if (!raw) return undefined as T;
		try {
			return JSON.parse(raw) as T;
		} catch {
			// Vários endpoints de escrita da CloudGym respondem texto puro
			// (ex.: id criado), não JSON — devolve como veio.
			return raw as unknown as T;
		}
	}

	// ── Catálogo (leitura) ───────────────────────────────────────────────────

	getPlans(companyId: string, unitId: number, page = 0, size = 100) {
		return this.request<GetAllPlansResponse>(
			companyId,
			`/config/plans/${unitId}`,
			{
				method: "GET",
				query: { page: String(page), size: String(size) },
			},
		);
	}

	getPlan(companyId: string, planId: number) {
		return this.request<GetPlanResponse>(companyId, `/config/plan/${planId}`, {
			method: "GET",
		});
	}

	getMemberWorkouts(companyId: string, memberId: number, page = 0, size = 100) {
		return this.request<GetMemberWorkoutsResponse>(
			companyId,
			`/workout/memberWorkout/${memberId}`,
			{
				method: "GET",
				query: { page: String(page), size: String(size) },
			},
		);
	}

	getExercise(companyId: string, exerciseId: number) {
		return this.request<GetExerciseResponse>(
			companyId,
			`/workout/exercise/${exerciseId}`,
			{ method: "GET" },
		);
	}

	// ── Escrita ──────────────────────────────────────────────────────────────

	createMember(companyId: string, payload: CreateMemberPayload) {
		return this.request<CreateMemberResponse>(companyId, "/customer", {
			method: "POST",
			body: payload,
		});
	}

	createContract(companyId: string, payload: CreateContractPayload) {
		return this.request<CreateContractResponse>(
			companyId,
			"/customer/contract",
			{
				method: "POST",
				body: payload,
			},
		);
	}

	changeContractDueDate(companyId: string, contractId: number, newDueDay: number) {
		return this.request<string>(
			companyId,
			`/customer/contract/${contractId}/changeduedate/${newDueDay}`,
			{ method: "PUT" },
		);
	}

	payInvoice(
		companyId: string,
		invoiceId: number,
		payload: PayInvoicesPayload,
	) {
		return this.request<PayInvoicesResponse>(
			companyId,
			`/customer/invoices/${invoiceId}/pay`,
			{ method: "POST", body: payload },
		);
	}

	confirmPayment(companyId: string, tid: string) {
		return this.request<ConfirmPaymentResponse>(
			companyId,
			`/customer/confirmpayment/${tid}`,
			{ method: "POST" },
		);
	}

	createWorkoutHistory(
		companyId: string,
		payload: CreateWorkoutHistoryPayload,
	) {
		return this.request<CreateWorkoutHistoryResponse>(
			companyId,
			"/workout/workoutHistory",
			{ method: "POST", body: payload },
		);
	}
}
