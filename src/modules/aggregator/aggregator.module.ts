import { Module } from "@nestjs/common";
import { AggregatorController } from "./aggregator.controller";
import { AggregatorService } from "./aggregator.service";
import { AggregatorLoginService } from "./aggregator-login.service";

@Module({
	controllers: [AggregatorController],
	providers: [AggregatorService, AggregatorLoginService],
})
export class AggregatorModule {}
