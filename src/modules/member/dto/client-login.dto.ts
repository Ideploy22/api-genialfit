import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ClientLoginDto {
	@ApiProperty({
		example: "52732297060",
		description: "CPF ou matrícula do cliente",
	})
	@IsNotEmpty()
	@IsString()
	identifier: string;
}
