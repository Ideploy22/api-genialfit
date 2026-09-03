import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { DeviceEvent, DeviceStatus, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PageDto } from "@/common/dto/page.dto";
import { PageMetaDto } from "@/common/dto/page-meta.dto";
import { PageOptionsDto } from "@/common/dto/page-options.dto";
import { PrismaService } from "@/database/prisma/prisma.service";
import { ActionDeviceDto } from "./dto/action-device.dto";
import { RegisterDeviceDto } from "./dto/register-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";

@Injectable()
export class DeviceService {
	constructor(private readonly prisma: PrismaService) {}

	async register(dto: RegisterDeviceDto) {
		const existing = await this.prisma.device.findUnique({
			where: { deviceId: dto.deviceId },
		});

		if (existing) {
			throw new ConflictException("Dispositivo já registrado.");
		}

		const hashedSecret = await bcrypt.hash(dto.deviceSecret, 12);

		const device = await this.prisma.device.create({
			data: {
				deviceId: dto.deviceId,
				hostname: dto.hostname,
				deviceSecret: hashedSecret,
				serialNumber: dto.serialNumber,
				macAddress: dto.macAddress,
				os: dto.os,
				appVersion: dto.appVersion,
				companyId: dto.companyId,
				logs: {
					create: {
						event: DeviceEvent.DEVICE_REGISTERED,
						description: "Dispositivo registrado e aguardando aprovação.",
						metadata: {
							hostname: dto.hostname,
							os: dto.os,
							appVersion: dto.appVersion,
						},
					},
				},
			},
		});

		return device;
	}

	async findAll(pageOptionsDto: PageOptionsDto) {
		const where: Prisma.DeviceWhereInput = {};
		const allowedFields = ["hostname", "displayName", "status"];

		if (pageOptionsDto.search) {
			if (!allowedFields.includes(pageOptionsDto.search.field)) {
				throw new UnprocessableEntityException(
					`Campo inválido: "${pageOptionsDto.search.field}". Permitidos: ${allowedFields.join(", ")}`,
				);
			}
			where[pageOptionsDto.search.field] = {
				contains: pageOptionsDto.search.value,
				mode: "insensitive",
			};
		}

		const [items, itemCount] = await Promise.all([
			this.prisma.device.findMany({
				where,
				skip: pageOptionsDto.skip,
				take: pageOptionsDto.all ? undefined : pageOptionsDto.take,
				orderBy: { createdAt: pageOptionsDto.order },
			}),
			this.prisma.device.count({ where }),
		]);

		return new PageDto(items, new PageMetaDto({ itemCount, pageOptionsDto }));
	}

	async findOne(id: string) {
		const device = await this.prisma.device.findUnique({
			where: { id },
			include: {
				sessions: true,
				logs: { orderBy: { createdAt: "desc" }, take: 20 },
			},
		});
		if (!device) throw new NotFoundException("Dispositivo não encontrado.");
		return device;
	}

	/**
	 * Usado pelo próprio totem (painel /admin local, sem sessão de admin) para
	 * saber se já foi aprovado — só devolve o status, nada sensível.
	 */
	async getStatus(id: string) {
		const device = await this.prisma.device.findUnique({
			where: { id },
			select: { status: true },
		});
		if (!device) throw new NotFoundException("Dispositivo não encontrado.");
		return device;
	}

	async update(id: string, dto: UpdateDeviceDto) {
		await this.findOne(id);
		return this.prisma.device.update({ where: { id }, data: dto });
	}

	async approve(id: string, dto: ActionDeviceDto, approvedBy: string) {
		const device = await this.findOne(id);

		if (device.status === DeviceStatus.APPROVED) {
			throw new ConflictException("Dispositivo já está aprovado.");
		}
		if (device.status === DeviceStatus.REVOKED) {
			throw new ConflictException(
				"Dispositivos revogados não podem ser reaprovados.",
			);
		}

		return this.prisma.device.update({
			where: { id },
			data: {
				status: DeviceStatus.APPROVED,
				approvedAt: new Date(),
				approvedBy,
				...(dto.companyId && { companyId: dto.companyId }),
				logs: {
					create: {
						event: DeviceEvent.DEVICE_APPROVED,
						description:
							dto.reason ?? "Dispositivo aprovado pelo administrador.",
						metadata: { approvedBy, companyId: dto.companyId },
					},
				},
			},
		});
	}

	async block(id: string, dto: ActionDeviceDto, blockedBy: string) {
		const device = await this.findOne(id);

		if (device.status === DeviceStatus.BLOCKED) {
			throw new ConflictException("Dispositivo já está bloqueado.");
		}
		if (device.status === DeviceStatus.REVOKED) {
			throw new ConflictException(
				"Dispositivos revogados não podem ser bloqueados.",
			);
		}

		return this.prisma.$transaction([
			this.prisma.device.update({
				where: { id },
				data: {
					status: DeviceStatus.BLOCKED,
					blockedAt: new Date(),
					blockedBy,
					logs: {
						create: {
							event: DeviceEvent.DEVICE_BLOCKED,
							description:
								dto.reason ?? "Dispositivo bloqueado pelo administrador.",
							metadata: { blockedBy },
						},
					},
				},
			}),
			this.prisma.deviceSession.updateMany({
				where: { deviceId: id, revokedAt: null },
				data: { revokedAt: new Date() },
			}),
		]);
	}

	async unblock(id: string, dto: ActionDeviceDto, unblockedBy: string) {
		const device = await this.findOne(id);

		if (device.status !== DeviceStatus.BLOCKED) {
			throw new ConflictException("Dispositivo não está bloqueado.");
		}

		return this.prisma.device.update({
			where: { id },
			data: {
				status: DeviceStatus.APPROVED,
				logs: {
					create: {
						event: DeviceEvent.DEVICE_UNBLOCKED,
						description:
							dto.reason ?? "Dispositivo desbloqueado pelo administrador.",
						metadata: { unblockedBy },
					},
				},
			},
		});
	}

	async revoke(id: string, dto: ActionDeviceDto, revokedBy: string) {
		const device = await this.findOne(id);

		if (device.status === DeviceStatus.REVOKED) {
			throw new ConflictException("Dispositivo já está revogado.");
		}

		return this.revokeTransaction(
			id,
			revokedBy,
			dto.reason ?? "Dispositivo revogado pelo administrador.",
		);
	}

	/**
	 * O próprio totem se revoga ao "Resetar totem" (troca de academia) — sem
	 * sessão de admin disponível ali, então a prova de identidade é o
	 * deviceSecret (device.json), o mesmo usado em POST /device/auth/login.
	 * Idempotente: reset chamado 2x (ex.: falha de rede no meio) não deve
	 * quebrar por "já revogado".
	 */
	async revokeSelf(id: string, deviceSecret: string) {
		const device = await this.prisma.device.findUnique({ where: { id } });
		if (!device) throw new NotFoundException("Dispositivo não encontrado.");

		const secretValid = await bcrypt.compare(deviceSecret, device.deviceSecret);
		if (!secretValid) {
			throw new UnauthorizedException("Credenciais inválidas.");
		}

		if (device.status === DeviceStatus.REVOKED) {
			return device;
		}

		await this.revokeTransaction(id, "device", "Totem resetado pelo próprio dispositivo.");
		return this.prisma.device.findUniqueOrThrow({ where: { id } });
	}

	private revokeTransaction(id: string, revokedBy: string, description: string) {
		return this.prisma.$transaction([
			this.prisma.device.update({
				where: { id },
				data: {
					status: DeviceStatus.REVOKED,
					revokedAt: new Date(),
					revokedBy,
					logs: {
						create: {
							event: DeviceEvent.DEVICE_REVOKED,
							description,
							metadata: { revokedBy },
						},
					},
				},
			}),
			this.prisma.deviceSession.updateMany({
				where: { deviceId: id, revokedAt: null },
				data: { revokedAt: new Date() },
			}),
		]);
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.prisma.device.delete({ where: { id } });
	}

	async findLogs(id: string, pageOptionsDto: PageOptionsDto) {
		await this.findOne(id);

		const [items, itemCount] = await Promise.all([
			this.prisma.deviceLog.findMany({
				where: { deviceId: id },
				skip: pageOptionsDto.skip,
				take: pageOptionsDto.all ? undefined : pageOptionsDto.take,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.deviceLog.count({ where: { deviceId: id } }),
		]);

		return new PageDto(items, new PageMetaDto({ itemCount, pageOptionsDto }));
	}
}
