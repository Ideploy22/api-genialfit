import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { MemberEvent } from "@prisma/client";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CloudgymClientService } from "@/modules/cloudgym/cloudgym-client.service";
import { PayInvoiceDto } from "./dto/pay-invoice.dto";

/** Pontos concedidos por exercício concluído no totem (dado próprio, sem ledger completo nesta rodada). */
const POINTS_PER_EXERCISE = 10;

@Injectable()
export class MemberService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudgymClient: CloudgymClientService,
	) {}

	async getProfile(memberId: string) {
		const member = await this.prisma.member.findUnique({
			where: { id: memberId },
			include: {
				contracts: {
					where: { status: "ACTIVE" },
					orderBy: { createdAt: "desc" },
					take: 1,
				},
			},
		});
		if (!member) throw new NotFoundException("Cliente não encontrado.");

		return {
			id: member.id,
			name: member.name,
			avatar: member.avatar,
			points: member.points,
			planName: member.contracts[0]?.planName ?? null,
			dueDay: member.contracts[0]?.dueDay ?? null,
		};
	}

	/**
	 * A CloudGym modela o plano de treino como uma lista bruta de linhas
	 * (WorkoutProgram: até 4 exerciseId combinados por linha, sem campo de
	 * dia da semana explícito) — não existe um conceito nativo de "treino de
	 * hoje". Por ora devolvemos o programa atual completo do membro; quando o
	 * critério real de split por dia for confirmado com o cliente (provavelmente
	 * codificado em WorkoutFlow.config), este método pode filtrar por ele.
	 */
	async getWorkoutToday(memberId: string, companyId: string) {
		const member = await this.getCloudgymMember(memberId);
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const [cloudgymWorkout, completions] = await Promise.all([
			this.cloudgymClient.getMemberWorkouts(
				companyId,
				member.cloudgymMemberId as number,
			),
			this.prisma.workoutCompletion.findMany({
				where: { memberId, completedAt: { gte: startOfDay } },
			}),
		]);

		const doneRefs = new Set(completions.map((c) => c.exerciseRef));
		const rows = cloudgymWorkout.content ?? [];
		const exercisesById = await this.resolveExerciseNames(companyId, rows);

		return rows.map((row) => {
			const exercise =
				row.exerciceId !== undefined ? exercisesById.get(row.exerciceId) : undefined;

			return {
				exerciseRef: String(row.id),
				order: row.orderNumber ?? 0,
				name: exercise?.name ?? `Exercício ${row.orderNumber ?? ""}`.trim(),
				group: exercise?.groupName ?? null,
				series: row.series ?? null,
				reps: row.reps ?? null,
				load: row.load ?? null,
				annotation: row.annotation ?? null,
				points: POINTS_PER_EXERCISE,
				status: doneRefs.has(String(row.id)) ? "done" : "pending",
			};
		});
	}

	/**
	 * WorkoutProgram (linha do treino) só guarda o exerciceId — nome e grupo
	 * muscular vêm do catálogo (GET /workout/exercise/{id}), resolvido aqui
	 * uma vez por id único da lista. Se um exercício não for encontrado
	 * (removido do catálogo), a linha cai no fallback "Exercício N" — não
	 * derruba a tela inteira.
	 */
	private async resolveExerciseNames(
		companyId: string,
		rows: { exerciceId?: number }[],
	): Promise<Map<number, { name: string; groupName: string | null }>> {
		const ids = [...new Set(rows.map((row) => row.exerciceId).filter((id) => id !== undefined))];
		const result = new Map<number, { name: string; groupName: string | null }>();

		await Promise.all(
			ids.map(async (id) => {
				try {
					const exercise = await this.cloudgymClient.getExercise(companyId, id);
					result.set(id, { name: exercise.name, groupName: exercise.groupName ?? null });
				} catch {
					// Segue sem nome — a linha usa o fallback "Exercício N".
				}
			}),
		);

		return result;
	}

	async completeWorkoutExercise(memberId: string, exerciseRef: string) {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const already = await this.prisma.workoutCompletion.findFirst({
			where: { memberId, exerciseRef, completedAt: { gte: startOfDay } },
		});
		if (already) return already;

		const [completion] = await this.prisma.$transaction([
			this.prisma.workoutCompletion.create({
				data: { memberId, exerciseRef, pointsAwarded: POINTS_PER_EXERCISE },
			}),
			this.prisma.member.update({
				where: { id: memberId },
				data: { points: { increment: POINTS_PER_EXERCISE } },
			}),
			this.prisma.memberLog.create({
				data: {
					memberId,
					event: MemberEvent.WORKOUT_COMPLETED,
					description: `Exercício ${exerciseRef} concluído.`,
					metadata: { exerciseRef },
				},
			}),
		]);

		return completion;
	}

	getInvoices(memberId: string) {
		return this.prisma.invoice.findMany({
			where: { memberId },
			orderBy: { dueDate: "desc" },
		});
	}

	async payInvoice(
		memberId: string,
		companyId: string,
		invoiceId: string,
		dto: PayInvoiceDto,
	) {
		const invoice = await this.prisma.invoice.findFirst({
			where: { id: invoiceId, memberId },
		});
		if (!invoice || invoice.cloudgymInvoiceId === null) {
			throw new NotFoundException("Fatura não encontrada.");
		}

		const result = await this.cloudgymClient.payInvoice(
			companyId,
			invoice.cloudgymInvoiceId,
			dto,
		);

		// Confirmação definitiva de status chega via webhook (payment.confirmed);
		// aqui só sinalizamos otimisticamente que o pagamento foi enviado.
		await this.prisma.memberLog.create({
			data: {
				memberId,
				event: MemberEvent.INVOICE_PAID,
				description: `Pagamento da fatura ${invoice.id} enviado à CloudGym.`,
				metadata: { invoiceId: invoice.id, response: result },
			},
		});

		return { ok: true };
	}

	confirmPayment(companyId: string, tid: string) {
		return this.cloudgymClient.confirmPayment(companyId, tid);
	}

	async changeDueDate(memberId: string, companyId: string, newDueDay: number) {
		const contract = await this.getActiveCloudgymContract(memberId);

		await this.cloudgymClient.changeContractDueDate(
			companyId,
			contract.cloudgymContractId as number,
			newDueDay,
		);

		const updated = await this.prisma.contract.update({
			where: { id: contract.id },
			data: { dueDay: newDueDay },
		});

		return { dueDay: updated.dueDay };
	}

	private async getCloudgymMember(memberId: string) {
		const member = await this.prisma.member.findUnique({
			where: { id: memberId },
		});
		if (!member) throw new NotFoundException("Cliente não encontrado.");
		if (member.cloudgymMemberId === null) {
			throw new BadRequestException(
				"Cadastro do cliente ainda não foi confirmado pela CloudGym.",
			);
		}
		return member;
	}

	private async getActiveCloudgymContract(memberId: string) {
		const contract = await this.prisma.contract.findFirst({
			where: { memberId, status: "ACTIVE" },
			orderBy: { createdAt: "desc" },
		});
		if (!contract) {
			throw new NotFoundException("Contrato ativo não encontrado.");
		}
		if (contract.cloudgymContractId === null) {
			throw new BadRequestException(
				"Contrato não está vinculado à CloudGym.",
			);
		}
		return contract;
	}
}
