import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshDeviceDto {
	@ApiProperty({ description: "Refresh token recebido no login" })
	@IsString()
	@IsNotEmpty()
	refreshToken: string;
}
