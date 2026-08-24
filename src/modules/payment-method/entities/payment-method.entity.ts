import { ApiProperty } from "@nestjs/swagger";
import { PaymentMethodType } from "@prisma/client";

/** Formato consumido pelo totem (GET /payment-method) — só o que ele precisa pra montar a lista de escolha. */
export class PaymentMethodEntity {
	@ApiProperty()
	id: string;

	@ApiProperty({ enum: PaymentMethodType })
	type: PaymentMethodType;

	@ApiProperty()
	order: number;
}
