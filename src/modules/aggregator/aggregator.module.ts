import { Module } from "@nestjs/common";
import { CloudgymModule } from "@/modules/cloudgym/cloudgym.module";
import { MemberModule } from "@/modules/member/member.module";
import { AggregatorController } from "./aggregator.controller";
import { AggregatorService } from "./aggregator.service";
import { AggregatorLoginService } from "./aggregator-login.service";

@Module({
	imports: [MemberModule, CloudgymModule],
	controllers: [AggregatorController],
	providers: [AggregatorService, AggregatorLoginService],
})
export class AggregatorModule {}
