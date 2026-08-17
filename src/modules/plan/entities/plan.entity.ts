import { ApiProperty } from "@nestjs/swagger";

/** Formato consumido pelo totem (ver genialfit/src/renderer/src/pages/plans/data.ts). */
export class PlanEntity {
	@ApiProperty({ description: "Id do plano na CloudGym, como string" })
	id: string;

	@ApiProperty()
	namePlan: string;

	@ApiProperty({ required: false, nullable: true })
	descriptionPlan: string | null;

	@ApiProperty()
	price: number;

	@ApiProperty({ required: false })
	discount?: number;

	@ApiProperty({ required: false })
	costBenefits?: boolean;

	@ApiProperty({ type: [String] })
	services: string[];
}
