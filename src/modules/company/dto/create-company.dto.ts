import { ApiProperty } from "@nestjs/swagger";
import { CompanyType } from "@prisma/client";
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
} from "class-validator";

export class CreateColorCompanyDto {
	@ApiProperty({ required: false, example: "#FFFFFF" })
	@IsOptional()
	@IsString()
	primary1?: string;

	@ApiProperty({ required: false, example: "#000000" })
	@IsOptional()
	@IsString()
	primary2?: string;

	@ApiProperty({ required: false, example: "#FF0000" })
	@IsOptional()
	@IsString()
	primary3?: string;
}

export class CreateCompanyDto {
	@ApiProperty({ example: "Genialfit Academia" })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ enum: CompanyType, example: CompanyType.JURIDICA })
	@IsEnum(CompanyType)
	type: CompanyType;

	@ApiProperty({ required: false, example: "America/Sao_Paulo" })
	@IsOptional()
	@IsString()
	timezone?: string;

	@ApiProperty({ required: false, example: "(11) 99999-9999" })
	@IsOptional()
	@IsString()
	phone?: string;

	@ApiProperty({ required: false, example: "Rua das Flores, 123" })
	@IsOptional()
	@IsString()
	address?: string;

	@ApiProperty({ required: false, example: "123.456.789-00" })
	@IsOptional()
	@IsString()
	@Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "CPF inválido" })
	cpf?: string;

	@ApiProperty({ required: false, example: "12.345.678/0001-99" })
	@IsOptional()
	@IsString()
	@Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: "CNPJ inválido" })
	cnpj?: string;

	@ApiProperty({ required: false, type: () => CreateColorCompanyDto })
	@IsOptional()
	colorCompany?: CreateColorCompanyDto;
}
