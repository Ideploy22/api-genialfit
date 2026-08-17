import {
	BadRequestException,
	Injectable,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { MemberEvent, MemberStatus } from "@prisma/client";
import { PrismaService } from "@/database/prisma/prisma.service";

/**
 * Recebe eventos que a CloudGym dispara para nós (member/contract/invoice
 * criado ou atualizado). O payload real ainda não está documentado com o
 * cliente, então a extração de campos abaixo é best-effort — sempre gravamos
 * o evento bruto em CloudgymWebhookEvent primeiro, então nenhum dado se perde
 * mesmo que o shape não bata exatamente com o assumido aqui. Ajustar os
 * `extractX` quando o payload real for confirmado.
 */
@Injectable()
export class CloudgymWebhookService {
	private readonly logger = new Logger(CloudgymWebhookService.name);

	constructor(private readonly prisma: PrismaService) {}

	async handle(
		payload: Record<string, any>,
		webhookSecret: string | undefined,
		companyIdHint?: string,
	) {
		const integration = await this.resolveIntegration(payload, companyIdHint);

		if (!integration || integration.webhookSecret !== webhookSecret) {
			throw new UnauthorizedException("Webhook secret inválido.");
		}

		const eventType = String(payload.eventType ?? payload.event ?? "unknown");

		const event = await this.prisma.cloudgymWebhookEvent.create({
			data: { companyId: integration.companyId, eventType, payload },
		});

		try {
			await this.dispatch(integration.companyId, eventType, payload);
			await this.prisma.cloudgymWebhookEvent.update({
				where: { id: event.id },
				data: { processed: true },
			});
		} catch (error) {
			this.logger.error(`Falha ao processar webhook ${eventType}: ${error}`);
			await this.prisma.cloudgymWebhookEvent.update({
				where: { id: event.id },
				data: { error: String(error) },
			});
		}

		// Sempre 200 — evita reenvio indefinido de eventos que não reconhecemos.
		return { ok: true };
	}

	private async resolveIntegration(
		payload: Record<string, any>,
		companyIdHint?: string,
	) {
		if (companyIdHint) {
			return this.prisma.cloudgymIntegration.findUnique({
				where: { companyId: companyIdHint },
			});
		}

		const unitId = payload.unitId ?? payload.unit ?? payload.company_id;
		if (unitId === undefined) {
			throw new BadRequestException(
				"Não foi possível identificar a empresa do webhook (informe ?companyId= ou unitId no payload).",
			);
		}

		return this.prisma.cloudgymIntegration.findFirst({
			where: { unitId: Number(unitId) },
		});
	}

	private async dispatch(
		companyId: string,
		eventType: string,
		payload: Record<string, any>,
	) {
		switch (eventType) {
			case "member.created":
			case "member.updated":
				return this.upsertMember(companyId, payload);
			case "contract.created":
			case "contract.updated":
				return this.upsertContract(companyId, payload);
			case "invoice.created":
			case "payment.confirmed":
				return this.upsertInvoice(companyId, payload);
			default:
				this.logger.warn(`Evento CloudGym não reconhecido: ${eventType}`);
		}
	}

	private extractMember(payload: Record<string, any>) {
		const raw = payload.member ?? payload.data ?? payload;
		return {
			cloudgymMemberId: raw.id ?? raw.memberId,
			cpf: raw.cpf ?? null,
			name: raw.name ?? "Sem nome",
			email: raw.email ?? null,
			phone: raw.cellPhoneNumber ?? raw.phoneNumber ?? raw.phone ?? null,
		};
	}

	private async upsertMember(companyId: string, payload: Record<string, any>) {
		const data = this.extractMember(payload);
		if (data.cloudgymMemberId === undefined) return;
		const cloudgymMemberId = Number(data.cloudgymMemberId);

		// Member pode já existir localmente sem cloudgymMemberId (criado pelo
		// fluxo de cadastro do totem antes da CloudGym confirmar o id) — nesse
		// caso associa em vez de duplicar.
		const existingByCloudgymId = await this.prisma.member.findUnique({
			where: { companyId_cloudgymMemberId: { companyId, cloudgymMemberId } },
		});
		const existingByCpf =
			!existingByCloudgymId && data.cpf
				? await this.prisma.member.findFirst({
						where: { companyId, cpf: data.cpf, cloudgymMemberId: null },
					})
				: null;

		const updateData = {
			cloudgymMemberId,
			cpf: data.cpf ?? undefined,
			name: data.name,
			email: data.email ?? undefined,
			phone: data.phone ?? undefined,
		};

		const member = existingByCloudgymId
			? await this.prisma.member.update({
					where: { id: existingByCloudgymId.id },
					data: updateData,
				})
			: existingByCpf
				? await this.prisma.member.update({
						where: { id: existingByCpf.id },
						data: updateData,
					})
				: await this.prisma.member.create({
						data: { companyId, status: MemberStatus.ACTIVE, ...updateData },
					});

		await this.prisma.memberLog.create({
			data: {
				memberId: member.id,
				event: MemberEvent.SYNCED_WEBHOOK,
				description: "Membro sincronizado via webhook CloudGym.",
				metadata: payload,
			},
		});
	}

	private async upsertContract(
		companyId: string,
		payload: Record<string, any>,
	) {
		const raw = payload.contract ?? payload.data ?? payload;
		const cloudgymMemberId = raw.memberId ?? raw.member?.id;
		const cloudgymContractId = raw.id ?? raw.contractId;
		if (cloudgymMemberId === undefined || cloudgymContractId === undefined)
			return;

		const member = await this.prisma.member.findUnique({
			where: {
				companyId_cloudgymMemberId: {
					companyId,
					cloudgymMemberId: Number(cloudgymMemberId),
				},
			},
		});
		if (!member) {
			this.logger.warn(
				`Contrato recebido para membro CloudGym ${cloudgymMemberId} ainda não sincronizado.`,
			);
			return;
		}

		const existing = await this.prisma.contract.findFirst({
			where: {
				memberId: member.id,
				cloudgymContractId: Number(cloudgymContractId),
			},
		});

		const data = {
			cloudgymPlanId: raw.plan ?? raw.planId ?? undefined,
			planName: raw.planName ?? undefined,
			price: raw.price ?? undefined,
			startDate: raw.startDate ? new Date(raw.startDate) : undefined,
			dueDay: raw.dueDay ?? undefined,
			raw: payload,
		};

		if (existing) {
			await this.prisma.contract.update({ where: { id: existing.id }, data });
		} else {
			await this.prisma.contract.create({
				data: {
					memberId: member.id,
					cloudgymContractId: Number(cloudgymContractId),
					...data,
				},
			});
		}
	}

	private async upsertInvoice(companyId: string, payload: Record<string, any>) {
		const raw = payload.invoice ?? payload.data ?? payload;
		const cloudgymMemberId = raw.memberId ?? raw.member?.id;
		const cloudgymInvoiceId = raw.id ?? raw.invoiceId;
		if (cloudgymMemberId === undefined || cloudgymInvoiceId === undefined)
			return;

		const member = await this.prisma.member.findUnique({
			where: {
				companyId_cloudgymMemberId: {
					companyId,
					cloudgymMemberId: Number(cloudgymMemberId),
				},
			},
		});
		if (!member) {
			this.logger.warn(
				`Fatura recebida para membro CloudGym ${cloudgymMemberId} ainda não sincronizado.`,
			);
			return;
		}

		const paid = Boolean(raw.paid ?? raw.paidDate ?? raw.status === "PAID");

		await this.prisma.invoice.upsert({
			where: {
				memberId_cloudgymInvoiceId: {
					memberId: member.id,
					cloudgymInvoiceId: Number(cloudgymInvoiceId),
				},
			},
			create: {
				memberId: member.id,
				cloudgymInvoiceId: Number(cloudgymInvoiceId),
				amount: raw.value ?? raw.amount ?? 0,
				discount: raw.discount ?? 0,
				dueDate: raw.dueDate ? new Date(raw.dueDate) : new Date(),
				status: paid ? "PAID" : "PENDING",
				methodPayment: raw.methodPayment ?? undefined,
				paidAt: paid ? new Date(raw.paidDate ?? Date.now()) : undefined,
				raw: payload,
			},
			update: {
				status: paid ? "PAID" : "PENDING",
				paidAt: paid ? new Date(raw.paidDate ?? Date.now()) : undefined,
				raw: payload,
			},
		});
	}
}
