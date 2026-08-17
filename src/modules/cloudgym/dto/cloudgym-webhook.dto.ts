import { ApiProperty } from "@nestjs/swagger";

/**
 * O payload real de webhook da CloudGym ainda não está documentado com o
 * cliente — por isso o controller aceita o body como objeto livre
 * (Record<string, unknown>) e este DTO serve só de referência para o Swagger.
 * Todo evento é gravado em CloudgymWebhookEvent antes de qualquer parsing,
 * então nada é perdido mesmo se o shape real não bater com o esperado aqui.
 */
export class CloudgymWebhookDto {
	@ApiProperty({ required: false, example: "member.updated" })
	eventType?: string;

	@ApiProperty({ required: false, example: 123 })
	unitId?: number;
}
