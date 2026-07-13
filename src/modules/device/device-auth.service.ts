import {
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DeviceEvent, DeviceStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "@/database/prisma/prisma.service";
import { LoginDeviceDto } from "./dto/login-device.dto";
import { RefreshDeviceDto } from "./dto/refresh-device.dto";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

@Injectable()
export class DeviceAuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	async login(dto: LoginDeviceDto, ip?: string, userAgent?: string) {
		const device = await this.prisma.device.findUnique({
			where: { deviceId: dto.deviceId },
		});

		if (!device) {
			throw new NotFoundException("Dispositivo não encontrado.");
		}

		const secretValid = await bcrypt.compare(dto.deviceSecret, device.deviceSecret);
		if (!secretValid) {
			await this.prisma.deviceLog.create({
				data: {
					deviceId: device.id,
					event: DeviceEvent.LOGIN_FAILED,
					description: "Credenciais inválidas.",
					metadata: { ip },
				},
			});
			throw new UnauthorizedException("Credenciais inválidas.");
		}

		if (device.status !== DeviceStatus.APPROVED) {
			throw new ForbiddenException(
				`Dispositivo não autorizado. Status atual: ${device.status}.`,
			);
		}

		const tokens = await this.generateTokens(device.id, device.deviceId, device.companyId);

		await this.prisma.deviceSession.create({
			data: {
				deviceId: device.id,
				refreshToken: tokens.refreshTokenHash,
				ip,
				userAgent,
				expiresAt: tokens.refreshExpiresAt,
			},
		});

		await this.prisma.device.update({
			where: { id: device.id },
			data: {
				lastSeen: new Date(),
				logs: {
					create: {
						event: DeviceEvent.LOGIN_SUCCESS,
						description: "Login realizado com sucesso.",
						metadata: { ip, userAgent },
					},
				},
			},
		});

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshTokenPlain,
			expiresIn: ACCESS_TOKEN_EXPIRY,
		};
	}

	async refresh(dto: RefreshDeviceDto, ip?: string, userAgent?: string) {
		const hash = this.hashToken(dto.refreshToken);

		const session = await this.prisma.deviceSession.findUnique({
			where: { refreshToken: hash },
			include: { device: true },
		});

		if (!session || session.revokedAt || session.expiresAt < new Date()) {
			throw new UnauthorizedException("Refresh token inválido ou expirado.");
		}

		if (session.device.status !== DeviceStatus.APPROVED) {
			throw new ForbiddenException(
				`Dispositivo não autorizado. Status atual: ${session.device.status}.`,
			);
		}

		// Revoga a sessão atual (rotação de token)
		await this.prisma.deviceSession.update({
			where: { id: session.id },
			data: { revokedAt: new Date() },
		});

		const tokens = await this.generateTokens(
			session.device.id,
			session.device.deviceId,
			session.device.companyId,
		);

		await this.prisma.deviceSession.create({
			data: {
				deviceId: session.device.id,
				refreshToken: tokens.refreshTokenHash,
				ip,
				userAgent,
				expiresAt: tokens.refreshExpiresAt,
			},
		});

		await this.prisma.device.update({
			where: { id: session.device.id },
			data: {
				lastSeen: new Date(),
				logs: {
					create: {
						event: DeviceEvent.REFRESH_TOKEN,
						description: "Token renovado.",
						metadata: { ip },
					},
				},
			},
		});

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshTokenPlain,
			expiresIn: ACCESS_TOKEN_EXPIRY,
		};
	}

	async heartbeat(deviceId: string, ip?: string) {
		await this.prisma.device.update({
			where: { id: deviceId },
			data: {
				lastSeen: new Date(),
				logs: {
					create: {
						event: DeviceEvent.HEARTBEAT_RECEIVED,
						metadata: { ip },
					},
				},
			},
		});
		return { ok: true };
	}

	private async generateTokens(id: string, deviceId: string, companyId: string | null) {
		const payload = { sub: id, deviceId, companyId, type: "device" };

		const accessToken = this.jwtService.sign(payload, {
			expiresIn: ACCESS_TOKEN_EXPIRY,
		});

		const refreshTokenPlain = randomBytes(32).toString("hex");
		const refreshTokenHash = this.hashToken(refreshTokenPlain);
		const refreshExpiresAt = new Date();
		refreshExpiresAt.setDate(refreshExpiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

		return { accessToken, refreshTokenPlain, refreshTokenHash, refreshExpiresAt };
	}

	private hashToken(token: string): string {
		return createHash("sha256").update(token).digest("hex");
	}
}
