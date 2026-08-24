import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class DiscoverCloudgymUnitsDto {
	@ApiProperty({ example: "integracao@genialfit.com" })
	@IsNotEmpty()
	@IsString()
	username: string;

	@ApiProperty({ example: "senha-da-conta-cloudgym" })
	@IsNotEmpty()
	@IsString()
	password: string;

	@ApiProperty({ required: false, example: "https://api.prod.cloudgym.io" })
	@IsOptional()
	@IsUrl({ require_tld: false })
	baseUrl?: string;
}
