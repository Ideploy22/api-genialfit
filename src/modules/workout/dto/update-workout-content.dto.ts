import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateWorkoutContentDto } from "./create-workout-content.dto";

export class UpdateWorkoutContentDto extends PartialType(
	OmitType(CreateWorkoutContentDto, ["companyId", "memberId"] as const),
) {}
