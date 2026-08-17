import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBannerDto {
	@ApiProperty({ example: "company-uuid" })
	@IsNotEmpty()
	@IsString()
	companyId: string;

	@ApiProperty({ required: false, example: "Seja sua melhor versão" })
	@IsOptional()
	@IsString()
	title?: string;

	@ApiProperty({ required: false, example: "Compre direto no totem e evite filas." })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ required: false, default: 0, description: "Ordem de exibição no carrossel" })
	@IsOptional()
	@IsInt()
	order?: number;
}
