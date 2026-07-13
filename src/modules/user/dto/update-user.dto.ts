import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";

export class UpdateUserDto {
	@ApiPropertyOptional({ example: "João", description: "Nome do usuário" })
	@IsOptional()
	@IsNotEmpty()
	name?: string;

	@ApiPropertyOptional({
		example: "joao@teste.com",
		description: "Email do usuário",
	})
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ example: "123456", description: "Senha do usuário" })
	@IsOptional()
	@IsNotEmpty()
	@MinLength(6)
	password?: string;
}
