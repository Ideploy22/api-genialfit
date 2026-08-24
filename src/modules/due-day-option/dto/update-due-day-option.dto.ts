import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateDueDayOptionDto } from "./create-due-day-option.dto";

export class UpdateDueDayOptionDto extends PartialType(
	OmitType(CreateDueDayOptionDto, ["companyId"] as const),
) {}
