import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDeviceDto {
	@ApiProperty({ description: "UUID imutável do dispositivo", example: "550e8400-e29b-41d4-a716-446655440000" })
	@IsString()
	@IsNotEmpty()
	deviceId: string;

	@ApiProperty({ description: "Segredo plain gerado pelo Electron", example: "s3cr3t..." })
	@IsString()
	@IsNotEmpty()
	deviceSecret: string;
}
