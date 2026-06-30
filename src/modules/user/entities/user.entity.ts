import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsString } from "class-validator";

enum Role {
	ADMIN = "ADMIN",
	USER = "USER",
	MASTER = "MASTER",
}

export class User {
	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty()
	@IsString()
	email: string;

	@ApiProperty({ example: true, description: "" })
	@IsBoolean()
	active?: boolean;

	@ApiProperty({ example: Role.USER })
	@IsEnum(Role)
	role: string;
}
