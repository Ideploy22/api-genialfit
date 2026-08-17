import { ApiProperty } from "@nestjs/swagger";
import { AggregatorProvider } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class AggregatorLoginDto {
	@ApiProperty({
		enum: AggregatorProvider,
		example: AggregatorProvider.GYMPASS,
	})
	@IsEnum(AggregatorProvider)
	provider: AggregatorProvider;

	@ApiProperty({
		description: "Token/código informado pelo cliente no app do agregador",
	})
	@IsNotEmpty()
	@IsString()
	token: string;
}
