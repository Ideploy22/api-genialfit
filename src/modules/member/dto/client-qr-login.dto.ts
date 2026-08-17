import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ClientQrLoginDto {
	/**
	 * Hoje tratado como o mesmo identifier de CPF/matrícula (ver
	 * MemberAuthService.loginByQrCode) — ainda não existe emissor de QR de
	 * carteirinha digital no projeto.
	 */
	@ApiProperty({ example: "52732297060" })
	@IsNotEmpty()
	@IsString()
	token: string;
}
