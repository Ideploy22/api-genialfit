import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PayInvoiceDto {
	@ApiProperty({
		example: "CC",
		description: "Código do método de pagamento na CloudGym",
	})
	@IsNotEmpty()
	@IsString()
	methodPayment: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	cardNumber?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	ccv?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	expiryDate?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	card?: string;
}
