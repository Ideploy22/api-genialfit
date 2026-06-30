import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateDeviceDto {
	@ApiProperty({ required: false, example: "Recepção 01" })
	@IsOptional()
	@IsString()
	displayName?: string;

	@ApiProperty({ required: false, example: "1.1.0" })
	@IsOptional()
	@IsString()
	appVersion?: string;
}
