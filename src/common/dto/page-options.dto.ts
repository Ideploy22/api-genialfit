import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	Max,
	Min,
} from "class-validator";

export enum Order {
	ASC = "asc",
	DESC = "desc",
}

class SearchDto {
	@ApiPropertyOptional({
		description: "Campo a ser filtrado",
		example: "nome",
		default: "nome",
	})
	field: string;

	@ApiPropertyOptional({
		description: "Valor a ser filtrado",
		example: "John Doe",
		default: "John Doe",
	})
	value: string;
}

export class PageOptionsDto {
	@ApiPropertyOptional({ enum: Order, default: Order.ASC })
	@IsEnum(Order)
	@IsOptional()
	readonly order?: Order = Order.ASC;

	@ApiPropertyOptional({
		default: false,
		description: "Retornar todos os registros, ignorando paginação",
	})
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	@IsOptional()
	readonly all?: boolean = false;

	@ApiPropertyOptional({
		minimum: 1,
		default: 1,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	readonly page?: number = 1;

	@ApiPropertyOptional({
		description: "Filtro de busca",
	})
	@Type(() => SearchDto)
	@IsOptional()
	readonly search?: SearchDto;

	@ApiPropertyOptional({
		minimum: 1,
		maximum: 50,
		default: 10,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	@IsOptional()
	readonly take?: number = 10;

	get skip(): number {
		if (this.all) {
			return 0;
		}
		return ((this.page ?? 1) - 1) * (this.take ?? 10);
	}
}
