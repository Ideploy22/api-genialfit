import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PayInvoiceDto {
	@ApiProperty({
		example: "PIXA",
		description:
			"Forma de pagamento informada pelo totem (Pix/Débito/Crédito são telas instrutivas — sem coleta de dado de cartão) — guardado como registro, não repassado a nenhum provedor.",
	})
	@IsNotEmpty()
	@IsString()
	methodPayment: string;
}
