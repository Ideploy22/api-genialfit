import { ApiProperty } from "@nestjs/swagger";
import { AggregatorProvider } from "@prisma/client";
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateAggregatorDto {
	@ApiProperty({ example: "company-uuid" })
	@IsNotEmpty()
	@IsString()
	companyId: string;

	@ApiProperty({
		enum: AggregatorProvider,
		example: AggregatorProvider.GYMPASS,
	})
	@IsEnum(AggregatorProvider)
	provider: AggregatorProvider;

	@ApiProperty({ required: false, default: true })
	@IsOptional()
	@IsBoolean()
	active?: boolean;
}
