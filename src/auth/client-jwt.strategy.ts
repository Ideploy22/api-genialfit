import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "@/database/prisma/prisma.service";

export interface ClientJwtPayload {
	sub: string; // Member.id
	deviceId: string; // Device.id do totem onde o login ocorreu
	companyId: string;
	type: string;
}

/**
 * Sessão do cliente (membro) logado num totem. Sem refresh — sessão curta
 * (ver expiresIn em member-auth.service), coerente com o kiosk voltar pra
 * home entre atendimentos. Mirror de DeviceJwtStrategy.
 */
@Injectable()
export class ClientJwtStrategy extends PassportStrategy(
	Strategy,
	"client-jwt",
) {
	constructor(private readonly prisma: PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET || "secretKey",
		});
	}

	async validate(payload: ClientJwtPayload) {
		if (payload.type !== "client") {
			throw new UnauthorizedException("Token inválido para cliente.");
		}

		const member = await this.prisma.member.findUnique({
			where: { id: payload.sub },
		});

		if (!member || member.companyId !== payload.companyId) {
			throw new UnauthorizedException("Sessão de cliente inválida.");
		}

		return {
			memberId: member.id,
			companyId: member.companyId,
			deviceId: payload.deviceId,
		};
	}
}
