import { ApiProperty } from "@nestjs/swagger";
import { CompanyType } from "@prisma/client";
import { Transform } from "class-transformer";
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

	/**
	 * Sempre minúsculo, mesmo que a empresa/totem envie diferente — é a chave
	 * de busca pública do totem (GET /company/public/:unicName) contra um
	 * findUnique case-sensitive do Postgres, então cadastro em caixa
	 * diferente do que o totem consulta já gerou "empresa não encontrada"
	 * (o totem forçava UPPERCASE na busca). Normalizar aqui garante que
	 * nunca mais dependa de quem digitou usar a mesma caixa.
	 */
	@ApiProperty({ example: "genialfit" })
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
	unicName: string;

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
