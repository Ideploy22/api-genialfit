import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ClientJwtStrategy } from "@/auth/client-jwt.strategy";
import { CloudgymModule } from "@/modules/cloudgym/cloudgym.module";
import { DueDayOptionModule } from "@/modules/due-day-option/due-day-option.module";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";
import { MemberAuthService } from "./member-auth.service";

@Module({
	imports: [
		CloudgymModule,
		DueDayOptionModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || "secretKey",
			signOptions: { expiresIn: "30m" },
		}),
	],
	controllers: [MemberController],
	providers: [MemberAuthService, MemberService, ClientJwtStrategy],
	exports: [MemberAuthService, MemberService],
})
export class MemberModule {}
