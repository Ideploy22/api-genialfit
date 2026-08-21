import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { MultipartFile } from "@fastify/multipart";
import { MemberEvent } from "@prisma/client";
import { s3 } from "@/common/s3";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CloudgymClientService } from "@/modules/cloudgym/cloudgym-client.service";
import { mediaUrl } from "@/modules/midias/midias.utils";
import { PayInvoiceDto } from "./dto/pay-invoice.dto";

/** Pontos concedidos por exercício concluído no totem (dado próprio, sem ledger completo nesta rodada). */
const POINTS_PER_EXERCISE = 10;
/** Subpasta no bucket S3 onde ficam as fotos de perfil dos membros. */
const MEMBER_AVATAR_SUB = "members";

@Injectable()
export class MemberService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudgymClient: CloudgymClientService,
	) {}

	/** Lista de membros da empresa — alimenta a tela de admin (web-genialfit). */
	async findByCompany(companyId: string) {
		const members = await this.prisma.member.findMany({
			where: { companyId },
			select: {
				id: true,
				name: true,
				cpf: true,
				matricula: true,
				email: true,
				status: true,
				cloudgymMemberId: true,
				avatar: true,
				points: true,
			},
			orderBy: { name: "asc" },
		});

		return members.map((member) => ({
			...member,
			avatar: member.avatar ? mediaUrl(member.avatar, MEMBER_AVATAR_SUB) : null,
		}));
	}

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
			avatar: member.avatar ? mediaUrl(member.avatar, MEMBER_AVATAR_SUB) : null,
			points: member.points,
			planName: member.contracts[0]?.planName ?? null,
			dueDay: member.contracts[0]?.dueDay ?? null,
		};
	}

	/**
	 * Foto de perfil capturada na câmera do totem durante o cadastro (ver
	 * MemberController POST /member/me/avatar). Mesmo padrão de upload do
	 * banner/logo — sobrescreve a anterior, se houver.
	 */
	async uploadAvatar(memberId: string, file: MultipartFile) {
		const member = await this.prisma.member.findUnique({ where: { id: memberId } });
		if (!member) throw new NotFoundException("Cliente não encontrado.");

		const buffer = await file.toBuffer();
		const webFile = new File([new Uint8Array(buffer)], file.filename, {
			type: file.mimetype,
		});
		const key = await s3().post(webFile, MEMBER_AVATAR_SUB);

		if (member.avatar) {
			await s3()
				.del(member.avatar, MEMBER_AVATAR_SUB)
				.catch(() => null);
		}

		await this.prisma.member.update({ where: { id: memberId }, data: { avatar: key } });
		return { avatar: mediaUrl(key, MEMBER_AVATAR_SUB) };
	}

	/**
	 * Membro sem cloudgymMemberId nunca passou pela CloudGym (cadastro local,
	 * empresa sem CloudgymIntegration) — para esses o treino de hoje vem do
	 * catálogo local (WorkoutContent), sem nenhuma chamada à CloudGym. Membro
	 * vinculado à CloudGym usa o programa de treino de lá.
	 */
	async getWorkoutToday(memberId: string, companyId: string) {
		const member = await this.prisma.member.findUnique({
			where: { id: memberId },
		});
		if (!member) throw new NotFoundException("Cliente não encontrado.");

		return member.cloudgymMemberId === null
			? this.getWorkoutTodayLocal(companyId, memberId)
			: this.getWorkoutTodayCloudgym(memberId, companyId, member.cloudgymMemberId);
	}

	/**
	 * A CloudGym modela o plano de treino como uma lista bruta de linhas
	 * (WorkoutProgram: até 4 exerciseId combinados por linha, sem campo de
	 * dia da semana explícito) — não existe um conceito nativo de "treino de
	 * hoje". Por ora devolvemos o programa atual completo do membro; quando o
	 * critério real de split por dia for confirmado com o cliente (provavelmente
	 * codificado em WorkoutFlow.config), este método pode filtrar por ele.
	 */
	private async getWorkoutTodayCloudgym(
		memberId: string,
		companyId: string,
		cloudgymMemberId: number,
	) {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const [cloudgymWorkout, completions] = await Promise.all([
			this.cloudgymClient.getMemberWorkouts(companyId, cloudgymMemberId),
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
				/** CloudGym não tem conceito de ficha — sempre nulo neste caminho. */
				ficha: null as string | null,
			};
		});
	}

	/**
	 * Treino 100% local (WorkoutContent) — não é overlay nem cache de nada da
	 * CloudGym, é o único dado de treino que membros locais têm. Individual
	 * por membro (cada aluno tem o seu), cadastrado hoje pelo admin
	 * (web-genialfit) e no futuro pelo treinador direto para aquele aluno.
	 * Exercícios são agrupados por ficha (label) e alternam a cada visita —
	 * ver `resolveCurrentFicha`.
	 */
	private async getWorkoutTodayLocal(companyId: string, memberId: string) {
		const content = await this.prisma.workoutContent.findMany({
			where: { companyId, memberId },
			orderBy: { order: "asc" },
		});
		if (content.length === 0) return [];

		const fichas = [...new Set(content.map((item) => item.label))];
		const currentFicha = await this.resolveCurrentFicha(memberId, content, fichas);

		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);
		const completions = await this.prisma.workoutCompletion.findMany({
			where: { memberId, completedAt: { gte: startOfDay } },
		});
		const doneRefs = new Set(completions.map((c) => c.exerciseRef));

		return content
			.filter((item) => item.label === currentFicha)
			.map((item, index) => ({
				exerciseRef: item.id,
				order: item.order || index + 1,
				name: item.name,
				group: item.group,
				series: item.series,
				reps: item.reps,
				load: item.load,
				annotation: item.annotation,
				points: item.points,
				status: doneRefs.has(item.id) ? "done" : "pending",
				ficha: currentFicha,
			}));
	}

	/**
	 * Fichas (A/B/C...) alternam a cada visita — não por dia da semana fixo,
	 * que não é como academia funciona na prática (aluno não vem sempre nos
	 * mesmos dias). Regra: se o último exercício concluído foi HOJE, o aluno
	 * ainda está no meio dessa ficha — continua nela. Se foi em outro dia (ou
	 * nunca concluiu nada), é uma visita nova — avança pra próxima ficha da
	 * rotação.
	 */
	private async resolveCurrentFicha(
		memberId: string,
		content: { id: string; label: string | null }[],
		fichas: (string | null)[],
	) {
		const lastCompletion = await this.prisma.workoutCompletion.findFirst({
			where: { memberId, exerciseRef: { in: content.map((item) => item.id) } },
			orderBy: { completedAt: "desc" },
		});
		if (!lastCompletion) return fichas[0];

		const lastItem = content.find((item) => item.id === lastCompletion.exerciseRef);
		const lastFicha = lastItem ? lastItem.label : fichas[0];

		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);
		if (lastCompletion.completedAt >= startOfDay) return lastFicha;

		const index = fichas.indexOf(lastFicha);
		return fichas[(index + 1) % fichas.length];
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

	/**
	 * Pontos concedidos: exerciseRef de treino local aponta pra um
	 * WorkoutContent com `points` configurado pelo admin — usa esse valor
	 * (era ignorado antes, sempre premiava o flat POINTS_PER_EXERCISE mesmo
	 * quando a tela mostrava um valor diferente pro aluno). CloudGym não tem
	 * pontos por exercício, então cai no flat mesmo.
	 */
	async completeWorkoutExercise(memberId: string, exerciseRef: string) {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const already = await this.prisma.workoutCompletion.findFirst({
			where: { memberId, exerciseRef, completedAt: { gte: startOfDay } },
		});
		if (already) return already;

		const localExercise = await this.prisma.workoutContent.findFirst({
			where: { id: exerciseRef, memberId },
		});
		const pointsAwarded = localExercise?.points ?? POINTS_PER_EXERCISE;

		const [completion] = await this.prisma.$transaction([
			this.prisma.workoutCompletion.create({
				data: { memberId, exerciseRef, pointsAwarded },
			}),
			this.prisma.member.update({
				where: { id: memberId },
				data: { points: { increment: pointsAwarded } },
			}),
			this.prisma.memberLog.create({
				data: {
					memberId,
					event: MemberEvent.WORKOUT_COMPLETED,
					description: `Exercício ${exerciseRef} concluído.`,
					metadata: { exerciseRef, pointsAwarded },
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
