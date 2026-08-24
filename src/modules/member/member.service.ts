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
import { DueDayOptionService } from "@/modules/due-day-option/due-day-option.service";
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
		private readonly dueDayOptionService: DueDayOptionService,
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

	/** Detalhe de um membro pro admin (web-genialfit) — inclui contrato ativo pra mostrar plano/vencimento. */
	async findOneForCompany(companyId: string, memberId: string) {
		const member = await this.prisma.member.findFirst({
			where: { id: memberId, companyId },
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
			cpf: member.cpf,
			matricula: member.matricula,
			email: member.email,
			phone: member.phone,
			status: member.status,
			avatar: member.avatar ? mediaUrl(member.avatar, MEMBER_AVATAR_SUB) : null,
			points: member.points,
			planName: member.contracts[0]?.planName ?? null,
			price: member.contracts[0]?.price ?? null,
			dueDay: member.contracts[0]?.dueDay ?? null,
		};
	}

	/** Faturas de um membro pro admin — mesma geração local de getInvoices, só com o check de empresa antes. */
	async getInvoicesForCompany(companyId: string, memberId: string) {
		await this.assertMemberInCompany(companyId, memberId);
		return this.getInvoices(memberId);
	}

	/** Marca fatura como paga por fora do totem (ex.: pagamento recebido na recepção). */
	async markInvoicePaidByAdmin(
		companyId: string,
		memberId: string,
		invoiceId: string,
		methodPayment?: string,
	) {
		await this.assertMemberInCompany(companyId, memberId);
		return this.payInvoice(memberId, invoiceId, {
			methodPayment: methodPayment ?? "Manual (recepção)",
		});
	}

	private async assertMemberInCompany(companyId: string, memberId: string) {
		const member = await this.prisma.member.findFirst({
			where: { id: memberId, companyId },
		});
		if (!member) throw new NotFoundException("Cliente não encontrado.");
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

	/**
	 * Fatura é 100% local — nasce aqui a partir do Contract ativo
	 * (price/dueDay), não de um webhook da CloudGym (isso volta quando a
	 * ligação via agregador for implementada de verdade). Sem
	 * scheduler/cron nesta rodada: a fatura do próximo ciclo só nasce
	 * quando a atual é paga (ver payInvoice) ou, na primeira consulta,
	 * quando ainda não existe nenhuma — e o status OVERDUE é recalculado
	 * na leitura, não por um job noturno.
	 */
	async getInvoices(memberId: string) {
		await this.syncLocalInvoices(memberId);
		return this.prisma.invoice.findMany({
			where: { memberId },
			orderBy: { dueDate: "desc" },
		});
	}

	async payInvoice(memberId: string, invoiceId: string, dto: PayInvoiceDto) {
		const invoice = await this.prisma.invoice.findFirst({
			where: { id: invoiceId, memberId },
		});
		if (!invoice) {
			throw new NotFoundException("Fatura não encontrada.");
		}
		if (invoice.status === "PAID") {
			throw new BadRequestException("Fatura já está paga.");
		}

		/**
		 * Sem gateway de pagamento próprio: Pix/Débito/Crédito no totem são
		 * telas instrutivas (escaneie QR / insira o cartão na maquininha
		 * POS) — quando o aluno chega aqui, o staff já viu o pagamento
		 * acontecer fisicamente, então marcamos como pago na hora, sem
		 * confirmação assíncrona de terceiro.
		 */
		const paid = await this.prisma.invoice.update({
			where: { id: invoice.id },
			data: { status: "PAID", paidAt: new Date(), methodPayment: dto.methodPayment },
		});

		await this.prisma.memberLog.create({
			data: {
				memberId,
				event: MemberEvent.INVOICE_PAID,
				description: `Pagamento da fatura ${invoice.id} registrado no totem.`,
				metadata: { invoiceId: invoice.id, methodPayment: dto.methodPayment },
			},
		});

		await this.syncLocalInvoices(memberId);

		return paid;
	}

	/**
	 * O dia de vencimento é escolhido pelo aluno, mas só dentre o que a
	 * empresa cadastrou (DueDayOption) — evita o aluno mandar qualquer
	 * inteiro 1-31 direto pela API, fora do que o totem realmente oferece.
	 */
	async changeDueDate(memberId: string, companyId: string, newDueDay: number) {
		const contract = await this.getActiveContract(memberId);

		const isValid = await this.dueDayOptionService.isValidDayForCompany(companyId, newDueDay);
		if (!isValid) {
			throw new BadRequestException(
				"Esse dia de vencimento não está disponível para esta empresa.",
			);
		}

		const updated = await this.prisma.contract.update({
			where: { id: contract.id },
			data: { dueDay: newDueDay },
		});
		return { dueDay: updated.dueDay };
	}

	private async getActiveContract(memberId: string) {
		const contract = await this.prisma.contract.findFirst({
			where: { memberId, status: "ACTIVE" },
			orderBy: { createdAt: "desc" },
		});
		if (!contract) {
			throw new NotFoundException("Contrato ativo não encontrado.");
		}
		return contract;
	}

	private async syncLocalInvoices(memberId: string) {
		const contract = await this.prisma.contract.findFirst({
			where: { memberId, status: "ACTIVE" },
			orderBy: { createdAt: "desc" },
		});
		if (!contract || contract.price === null) return;

		const latest = await this.prisma.invoice.findFirst({
			where: { contractId: contract.id },
			orderBy: { dueDate: "desc" },
		});

		if (!latest) {
			await this.prisma.invoice.create({
				data: {
					memberId,
					contractId: contract.id,
					amount: contract.price,
					dueDate: this.nextDueDate(contract.startDate ?? contract.createdAt, contract.dueDay),
					status: "PENDING",
				},
			});
			return;
		}

		if (latest.status === "PENDING" && latest.dueDate < new Date()) {
			await this.prisma.invoice.update({
				where: { id: latest.id },
				data: { status: "OVERDUE" },
			});
		}
	}

	/** Avança 1 mês de calendário a partir de `from`, ajustando pro dia de vencimento do contrato. */
	private nextDueDate(from: Date, dueDay: number | null): Date {
		const next = new Date(from);
		next.setMonth(next.getMonth() + 1);
		if (dueDay) {
			const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
			next.setDate(Math.min(dueDay, lastDayOfMonth));
		}
		return next;
	}
}
