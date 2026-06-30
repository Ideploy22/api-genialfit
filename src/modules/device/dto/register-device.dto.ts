import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RegisterDeviceDto {
	@ApiProperty({
		description: "UUID imutável gerado pelo Electron",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsString()
	@IsNotEmpty()
	deviceId: string;

	@ApiProperty({
		description: "Nome do host Windows",
		example: "TOTEM-RECEPCAO",
	})
	@IsString()
	@IsNotEmpty()
	hostname: string;

	@ApiProperty({
		description: "Segredo do dispositivo (plain — será hasheado pela API)",
		example: "s3cr3t-g3r4d0-p3l0-3l3ctr0n",
	})
	@IsString()
	@IsNotEmpty()
	deviceSecret: string;

	@ApiProperty({ required: false, example: "SN-123456" })
	@IsOptional()
	@IsString()
	serialNumber?: string;

	@ApiProperty({ required: false, example: "AA:BB:CC:DD:EE:FF" })
	@IsOptional()
	@IsString()
	macAddress?: string;

	@ApiProperty({ required: false, example: "Windows 11 Pro 22H2" })
	@IsOptional()
	@IsString()
	os?: string;

	@ApiProperty({ required: false, example: "1.0.0" })
	@IsOptional()
	@IsString()
	appVersion?: string;

	@ApiProperty({
		description: "ID da empresa pré-configurado na tela de setup do Electron",
		example: "clx1234abcd",
	})
	@IsNotEmpty()
	@IsString()
	companyId: string;
}
