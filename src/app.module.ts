import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { AllExceptionsFilter } from "./common/filters/all-exception";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";
import { PrismaModule } from "./database/prisma/prisma.module";
import { CompanyModule } from "./modules/company/company.module";
import { DeviceModule } from "./modules/device/device.module";
import { UserModule } from "./modules/user/user.module";

@Module({
	imports: [
		PrismaModule,
		ConfigModule.forRoot({ isGlobal: true }),
		AuthModule,
		UserModule,
		CompanyModule,
		DeviceModule,
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
