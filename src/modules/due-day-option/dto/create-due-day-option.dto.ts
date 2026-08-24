import { ApiProperty } from "@nestjs/swagger";
import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class CreateDueDayOptionDto {
	@ApiProperty({ example: "company-uuid" })
	@IsNotEmpty()
	@IsString()
	companyId: string;

	@ApiProperty({ example: 10, description: "Dia do mês (1-31)" })
	@IsInt()
	@Min(1)
	@Max(31)
	day: number;

	@ApiProperty({ required: false, default: true })
	@IsOptional()
	@IsBoolean()
	active?: boolean;

	@ApiProperty({ required: false, default: 0, description: "Ordem de exibição no totem" })
	@IsOptional()
	@IsInt()
	order?: number;
}
