import { ApiProperty } from "@nestjs/swagger";
import { CompanyType } from "@prisma/client";

export class ColorCompanyEntity {
	@ApiProperty()
	id: string;

	@ApiProperty({ required: false, nullable: true })
	primary1: string | null;

	@ApiProperty({ required: false, nullable: true })
	primary2: string | null;

	@ApiProperty({ required: false, nullable: true })
	primary3: string | null;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty({ required: false, nullable: true })
	updatedAt: Date | null;
}

export class Company {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;

	@ApiProperty({ enum: CompanyType })
	type: CompanyType;

	@ApiProperty({ required: false, nullable: true })
	logo: string | null;

	@ApiProperty({ required: false, nullable: true })
	logoNegative: string | null;

	@ApiProperty({ required: false, nullable: true })
	timezone: string | null;

	@ApiProperty({ required: false, nullable: true })
	phone: string | null;

	@ApiProperty({ required: false, nullable: true })
	address: string | null;

	@ApiProperty({ required: false, nullable: true })
	cpf: string | null;

	@ApiProperty({ required: false, nullable: true })
	cnpj: string | null;

	@ApiProperty({ required: false, nullable: true })
	colors: string | null;

	@ApiProperty({
		type: () => ColorCompanyEntity,
		required: false,
		nullable: true,
	})
	colorCompany: ColorCompanyEntity | null;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty({ required: false, nullable: true })
	updatedAt: Date | null;
}
