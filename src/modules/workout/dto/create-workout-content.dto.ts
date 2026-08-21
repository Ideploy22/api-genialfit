import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateWorkoutContentDto {
	@ApiProperty({ example: "company-uuid" })
	@IsNotEmpty()
	@IsString()
	companyId: string;

	@ApiProperty({ example: "member-id" })
	@IsNotEmpty()
	@IsString()
	memberId: string;

	@ApiProperty({
		required: false,
		example: "A",
		description:
			"Ficha do treino (A, B, C...) — agrupa exercícios numa rotina que o aluno alterna a cada visita. Omitir cria uma ficha única implícita.",
	})
	@IsOptional()
	@IsString()
	label?: string;

	@ApiProperty({ example: "Supino reto com barra" })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ required: false, example: "Peito" })
	@IsOptional()
	@IsString()
	group?: string;

	@ApiProperty({ required: false, example: "3" })
	@IsOptional()
	@IsString()
	series?: string;

	@ApiProperty({ required: false, example: "12" })
	@IsOptional()
	@IsString()
	reps?: string;

	@ApiProperty({ required: false, example: "20kg" })
	@IsOptional()
	@IsString()
	load?: string;

	@ApiProperty({ required: false, example: "Cadência controlada" })
	@IsOptional()
	@IsString()
	annotation?: string;

	@ApiProperty({ required: false, default: 10 })
	@IsOptional()
	@IsInt()
	points?: number;

	@ApiProperty({ required: false, default: 0 })
	@IsOptional()
	@IsInt()
	order?: number;
}
