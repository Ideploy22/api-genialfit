import { Module } from "@nestjs/common";
import { CloudgymModule } from "@/modules/cloudgym/cloudgym.module";
import { PlanController } from "./plan.controller";
import { PlanService } from "./plan.service";

@Module({
	imports: [CloudgymModule],
	controllers: [PlanController],
	providers: [PlanService],
})
export class PlanModule {}
