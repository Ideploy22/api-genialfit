import { OmitType, PartialType } from "@nestjs/swagger";
import { CreatePlanContentDto } from "./create-plan-content.dto";

export class UpdatePlanContentDto extends PartialType(
	OmitType(CreatePlanContentDto, ["companyId", "cloudgymPlanId"] as const),
) {}
