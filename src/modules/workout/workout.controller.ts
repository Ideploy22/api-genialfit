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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { CreateWorkoutContentDto } from "./dto/create-workout-content.dto";
import { UpdateWorkoutContentDto } from "./dto/update-workout-content.dto";
import { WorkoutService } from "./workout.service";

/**
 * Admin (web-genialfit) gerencia o treino individual de cada membro local
 * aqui. O totem não chama estas rotas — ele lê o treino do dia via
 * GET /member/me/workout/today (MemberController), que decide sozinho se usa
 * este catálogo local ou o da CloudGym.
 */
@ApiTags("Workout — Conteúdo local")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller("workout/content")
export class WorkoutController {
	constructor(private readonly service: WorkoutService) {}

	@Get()
	@ApiOperation({ summary: "Listar exercícios do treino local de um membro" })
	@ApiQuery({ name: "companyId", required: true })
	@ApiQuery({ name: "memberId", required: true })
	findByMember(
		@Query("companyId") companyId: string,
		@Query("memberId") memberId: string,
	) {
		return this.service.findByMember(companyId, memberId);
	}

	@Post()
	@ApiOperation({ summary: "Criar exercício no treino local de um membro" })
	create(@Body() dto: CreateWorkoutContentDto) {
		return this.service.create(dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Atualizar exercício do treino local" })
	update(@Param("id") id: string, @Body() dto: UpdateWorkoutContentDto) {
		return this.service.update(id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Remover exercício do treino local" })
	remove(@Param("id") id: string) {
		return this.service.remove(id);
	}
}
