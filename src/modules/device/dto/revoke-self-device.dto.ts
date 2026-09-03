import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RevokeSelfDeviceDto {
	@ApiProperty({
		description: "Secret do dispositivo (device.json) — prova a identidade sem precisar de sessão de admin",
	})
	@IsNotEmpty()
	@IsString()
	deviceSecret: string;
}
