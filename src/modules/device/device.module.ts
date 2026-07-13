import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DeviceJwtStrategy } from "@/auth/device-jwt.strategy";
import { DeviceAuthService } from "./device-auth.service";
import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET || "secretKey",
			signOptions: { expiresIn: "15m" },
		}),
	],
	controllers: [DeviceController],
	providers: [DeviceService, DeviceAuthService, DeviceJwtStrategy],
	exports: [DeviceService, DeviceAuthService],
})
export class DeviceModule {}
