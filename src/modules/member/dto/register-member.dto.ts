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
		description:
			"Id do plano — vem de GET /plan. Se a empresa tem CloudGym, é o id numérico de lá (como string); se não, é o id de um PlanContent local.",
	})
	@IsNotEmpty()
	@IsString()
	planId: string;

	@ApiProperty({
		required: false,
		type: [String],
		example: ["avaliacao-fisica", "aulas-coletivas"],
		description:
			"Extras escolhidos no passo 'Turbine seu treino' — sem equivalente na CloudGym, fica registrado localmente (Contract.raw / MemberLog).",
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	extras?: string[];

	/**
	 * A CloudGym exige methodPayment em POST /customer; o wizard do totem
	 * ainda não tem um passo de pagamento (ver cadastro/store.ts) — por isso
	 * é opcional aqui e cai num default (ver MemberAuthService) até o
	 * frontend adicionar a etapa de cobrança.
	 */
	@ApiProperty({ required: false, example: "CC" })
	@IsOptional()
	@IsString()
	methodPayment?: string;
}
