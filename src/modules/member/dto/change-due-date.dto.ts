import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Max, Min } from "class-validator";

export class ChangeDueDateDto {
	@ApiProperty({ example: 10, description: "Novo dia de vencimento (1-31)" })
	@IsInt()
	@Min(1)
	@Max(31)
	newDueDay: number;
}
