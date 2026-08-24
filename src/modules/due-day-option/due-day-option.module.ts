import { Module } from "@nestjs/common";
import { DueDayOptionController } from "./due-day-option.controller";
import { DueDayOptionService } from "./due-day-option.service";

@Module({
	controllers: [DueDayOptionController],
	providers: [DueDayOptionService],
	exports: [DueDayOptionService],
})
export class DueDayOptionModule {}
