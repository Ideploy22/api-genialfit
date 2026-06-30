import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ActionDeviceDto {
	@ApiProperty({
		required: false,
		description: "Motivo da ação",
		example: "Dispositivo autorizado pela gerência",
	})
	@IsOptional()
	@IsString()
	reason?: string;

	@ApiProperty({
		required: false,
		description: "Vincular ou mover o dispositivo para uma empresa (usado na aprovação)",
		example: "clx1234abcd",
	})
	@IsOptional()
	@IsString()
	companyId?: string;
}
