import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "@/modules/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

@Global()
@Module({
	imports: [
		UserModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || "secretKey",
			signOptions: { expiresIn: "1h" },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
