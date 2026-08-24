import { ApiProperty } from "@nestjs/swagger";
import { PaymentIntegrationType, PaymentMethodType, type Prisma } from "@prisma/client";
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
} from "class-validator";

export class CreatePaymentMethodDto {
	@ApiProperty({ example: "company-uuid" })
	@IsNotEmpty()
	@IsString()
	companyId: string;

	@ApiProperty({ enum: PaymentMethodType, example: PaymentMethodType.PIX })
	@IsEnum(PaymentMethodType)
	type: PaymentMethodType;

	@ApiProperty({ required: false, default: true })
	@IsOptional()
	@IsBoolean()
	active?: boolean;

	@ApiProperty({ required: false, default: 0, description: "Ordem de exibição no totem" })
	@IsOptional()
	@IsInt()
	order?: number;

	@ApiProperty({
		required: false,
		enum: PaymentIntegrationType,
		default: PaymentIntegrationType.MANUAL,
		description:
			"MANUAL = tela instrutiva (maquininha avulsa, sem integração); PINPAD = reservado pra integração futura, ainda não implementada.",
	})
	@IsOptional()
	@IsEnum(PaymentIntegrationType)
	integrationType?: PaymentIntegrationType;

	@ApiProperty({
		required: false,
		example: "Stone",
		description: "Provedor do pinpad — só relevante quando integrationType = PINPAD.",
	})
	@IsOptional()
	@IsString()
	provider?: string;

	@ApiProperty({
		required: false,
		description: "Config livre pro SDK do pinpad quando a integração existir.",
	})
	@IsOptional()
	@IsObject()
	config?: Prisma.InputJsonValue;
}
