import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class MarkInvoicePaidDto {
	@ApiProperty({
		required: false,
		example: "Dinheiro na recepção",
		description: "Como o admin recebeu o pagamento — livre, só registro.",
	})
	@IsOptional()
	@IsString()
	methodPayment?: string;
}
