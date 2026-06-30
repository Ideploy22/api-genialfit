import { ApiProperty } from "@nestjs/swagger";

export class PaginationResponseDto<T> {
	@ApiProperty({ example: 1, description: "Página atual" })
	page: number;

	@ApiProperty({ example: 10, description: "Itens por página" })
	limit: number;

	@ApiProperty({ example: 50, description: "Total de itens disponíveis" })
	total: number;

	@ApiProperty({ description: "Lista de itens", isArray: true })
	items: T[];

	constructor(items: T[], total: number, page: number, limit: number) {
		this.items = items;
		this.total = total;
		this.page = page;
		this.limit = limit;
	}
}
