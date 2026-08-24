import { ApiProperty } from "@nestjs/swagger";

/** Formato consumido pelo totem (GET /due-day-option) — só o que ele precisa pra montar a lista de escolha. */
export class DueDayOptionEntity {
	@ApiProperty()
	id: string;

	@ApiProperty()
	day: number;

	@ApiProperty()
	order: number;
}
