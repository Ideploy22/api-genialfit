import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { AllExceptionsFilter } from "./common/filters/all-exception";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";
import { PrismaModule } from "./database/prisma/prisma.module";
import { AggregatorModule } from "./modules/aggregator/aggregator.module";
import { BannerModule } from "./modules/banner/banner.module";
import { CloudgymModule } from "./modules/cloudgym/cloudgym.module";
import { CompanyModule } from "./modules/company/company.module";
import { DeviceModule } from "./modules/device/device.module";
import { MemberModule } from "./modules/member/member.module";
import { MidiasModule } from "./modules/midias/midias.module";
import { PlanModule } from "./modules/plan/plan.module";
import { UserModule } from "./modules/user/user.module";
import { WorkoutModule } from "./modules/workout/workout.module";

@Module({
	imports: [
		PrismaModule,
		ConfigModule.forRoot({ isGlobal: true }),
		AuthModule,
		UserModule,
		MidiasModule,
		CompanyModule,
		DeviceModule,
		CloudgymModule,
		MemberModule,
		PlanModule,
		AggregatorModule,
		BannerModule,
		WorkoutModule,
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
		{
			provide: APP_FILTER,
			useClass: PrismaExceptionFilter,
		},
	],
})
export class AppModule {}
