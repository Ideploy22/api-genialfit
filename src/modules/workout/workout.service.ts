import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/database/prisma/prisma.service";
import { CreateWorkoutContentDto } from "./dto/create-workout-content.dto";
import { UpdateWorkoutContentDto } from "./dto/update-workout-content.dto";

/**
 * CRUD do treino local (WorkoutContent) — usado por membros sem
 * CloudgymIntegration (cloudgymMemberId nulo). Não tem relação com a
 * CloudGym: é o único dado de treino que esses membros têm. Individual por
 * membro (cada aluno tem o seu), cadastrado hoje pelo admin (web-genialfit)
 * e no futuro pelo treinador direto para aquele aluno.
 */
@Injectable()
export class WorkoutService {
	constructor(private readonly prisma: PrismaService) {}

	findByMember(companyId: string, memberId: string) {
		return this.prisma.workoutContent.findMany({
			where: { companyId, memberId },
			orderBy: { order: "asc" },
		});
	}

	create(dto: CreateWorkoutContentDto) {
		return this.prisma.workoutContent.create({ data: dto });
	}

	async findOne(id: string) {
		const item = await this.prisma.workoutContent.findUnique({
			where: { id },
		});
		if (!item) throw new NotFoundException("Exercício não encontrado.");
		return item;
	}

	async update(id: string, dto: UpdateWorkoutContentDto) {
		await this.findOne(id);
		return this.prisma.workoutContent.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.workoutContent.delete({ where: { id } });
	}
}
