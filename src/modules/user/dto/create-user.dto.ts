import { ApiProperty } from "@nestjs/swagger";
import {
	IsBoolean,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	MinLength,
} from "class-validator";

export enum Role {
	MASTER = "MASTER",
	ADMIN = "ADMIN",
	USER = "USER",
}

export class CreateUserDto {
	@ApiProperty({ example: "João", description: "Nome do usuário" })
	@IsNotEmpty()
	name: string;

	@ApiProperty({ example: "joao@teste.com", description: "Email do usuário" })
	@IsEmail()
	email: string;

	@ApiProperty({ example: true, description: "" })
	@IsBoolean()
	active?: boolean;

	@ApiProperty({ example: "", description: "" })
	@IsEnum(Role)
	role: Role;

	@ApiProperty({ example: "123456", description: "Senha do usuário" })
	@IsNotEmpty()
	@MinLength(6)
	password: string;

	@ApiProperty({
		type: "string",
		required: false,
		format: "binary",
		description: "Imagem do avatar",
	})
	@IsOptional()
	avatar?: string;
}
