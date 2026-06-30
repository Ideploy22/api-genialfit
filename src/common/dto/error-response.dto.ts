import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ErrorResponseDto {
	@ApiProperty()
	statusCode: number;

	@ApiProperty()
	timestamp: string;

	@ApiProperty()
	path: string;

	@ApiProperty()
	@IsString()
	message: string | string[];

	@ApiProperty()
	error: string;
}
