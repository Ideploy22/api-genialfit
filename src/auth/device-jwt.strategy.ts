import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { DeviceStatus } from "@prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "@/database/prisma/prisma.service";

export interface DeviceJwtPayload {
	sub: string;
	deviceId: string;
	companyId: string | null;
	type: string;
}

@Injectable()
export class DeviceJwtStrategy extends PassportStrategy(
	Strategy,
	"device-jwt",
) {
	constructor(private readonly prisma: PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET || "secretKey",
		});
	}

	async validate(payload: DeviceJwtPayload) {
		if (payload.type !== "device") {
			throw new UnauthorizedException("Token inválido para dispositivo.");
		}

		const device = await this.prisma.device.findUnique({
			where: { id: payload.sub },
		});

		if (!device) {
			throw new UnauthorizedException("Dispositivo não encontrado.");
		}

		if (device.status !== DeviceStatus.APPROVED) {
			throw new ForbiddenException(
				`Dispositivo não autorizado. Status: ${device.status}.`,
			);
		}

		// Atualiza lastSeen em background sem bloquear a requisição
		this.prisma.device
			.update({ where: { id: device.id }, data: { lastSeen: new Date() } })
			.catch(() => null);

		return {
			deviceId: device.id,
			externalDeviceId: device.deviceId,
			companyId: device.companyId,
		};
	}
}
