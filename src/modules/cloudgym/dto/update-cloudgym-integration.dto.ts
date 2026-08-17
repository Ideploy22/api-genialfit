import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateCloudgymIntegrationDto } from "./create-cloudgym-integration.dto";

export class UpdateCloudgymIntegrationDto extends PartialType(
	OmitType(CreateCloudgymIntegrationDto, ["companyId"] as const),
) {}
