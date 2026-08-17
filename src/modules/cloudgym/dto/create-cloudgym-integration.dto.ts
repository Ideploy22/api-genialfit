import { ApiProperty } from "@nestjs/swagger";
import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
} from "class-validator";

export class CreateCloudgymIntegrationDto {
	@ApiProperty({ example: "company-uuid" })
	@IsNotEmpty()
	@IsString()
	companyId: string;

	@ApiProperty({
		example: 123,
		description: "Id numérico da unidade na CloudGym",
	})
	@IsInt()
	unitId: number;

	@ApiProperty({ required: false, example: "https://api.cloudgym.com.br" })
	@IsOptional()
	@IsUrl({ require_tld: false })
	baseUrl?: string;

	@ApiProperty({ example: "integracao@genialfit.com" })
	@IsNotEmpty()
	@IsString()
	username: string;

	@ApiProperty({ example: "senha-da-conta-cloudgym" })
	@IsNotEmpty()
	@IsString()
	password: string;

	@ApiProperty({
		required: false,
		description:
			"Secret comparado ao header X-Webhook-Secret. Se omitido, é gerado automaticamente.",
	})
	@IsOptional()
	@IsString()
	webhookSecret?: string;

	@ApiProperty({ required: false, default: true })
	@IsOptional()
	@IsBoolean()
	active?: boolean;
}
