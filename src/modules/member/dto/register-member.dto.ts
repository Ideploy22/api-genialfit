import { ApiProperty } from "@nestjs/swagger";
import {
	IsArray,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class RegisterMemberDto {
	@ApiProperty({ example: "Pedro Santos Silva" })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ example: "(11) 99999-9999" })
	@IsNotEmpty()
	@IsString()
	phone: string;

	@ApiProperty({ example: "pedro@email.com" })
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ required: false, example: "52732297060" })
	@IsOptional()
	@IsString()
	cpf?: string;

	@ApiProperty({
		example: "1",
		description: "Id do plano — vem de GET /plan, sempre um PlanContent local.",
	})
	@IsNotEmpty()
	@IsString()
	planId: string;

	@ApiProperty({
		required: false,
		type: [String],
		example: ["avaliacao-fisica", "aulas-coletivas"],
		description:
			"Extras escolhidos no passo 'Turbine seu treino' — fica registrado localmente (Contract.raw / MemberLog).",
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	extras?: string[];
}
