import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateBannerDto } from "./create-banner.dto";

export class UpdateBannerDto extends PartialType(
	OmitType(CreateBannerDto, ["companyId"] as const),
) {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	active?: boolean;
}
