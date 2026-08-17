import { ApiProperty } from "@nestjs/swagger";
import {
	IsArray,
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";

export class CreatePlanContentDto {
	@ApiProperty({ example: "company-uuid" })
	@IsNotEmpty()
	@IsString()
	companyId: string;

	@ApiProperty({
		required: false,
		example: 1,
		description:
			"Id do plano na CloudGym. Omitir cria um plano 100% local (empresa sem CloudGym) — nesse caso `price` é obrigatório.",
	})
	@IsOptional()
	@IsInt()
	cloudgymPlanId?: number;

	@ApiProperty({ example: "Plano Mensal" })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({
		required: false,
		example: 149.9,
		description: "Preço — obrigatório quando o plano não é vinculado à CloudGym.",
	})
	@IsOptional()
	@IsNumber()
	price?: number;

	@ApiProperty({ required: false, example: "Acesso a todas as unidades." })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ required: false, type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	services?: string[];

	@ApiProperty({ required: false, example: 15 })
	@IsOptional()
	@IsInt()
	discount?: number;

	@ApiProperty({ required: false, default: false })
	@IsOptional()
	@IsBoolean()
	highlighted?: boolean;

	@ApiProperty({ required: false, default: 0 })
	@IsOptional()
	@IsInt()
	order?: number;
}
