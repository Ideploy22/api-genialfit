import { OmitType, PartialType } from "@nestjs/swagger";
import { CreatePaymentMethodDto } from "./create-payment-method.dto";

export class UpdatePaymentMethodDto extends PartialType(
	OmitType(CreatePaymentMethodDto, ["companyId"] as const),
) {}
