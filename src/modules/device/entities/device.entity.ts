import { ApiProperty } from "@nestjs/swagger";
import { DeviceEvent, DeviceStatus } from "@prisma/client";

export class DeviceSessionEntity {
	@ApiProperty()
	id: string;

	@ApiProperty()
	deviceId: string;

	@ApiProperty({ nullable: true })
	ip: string | null;

	@ApiProperty({ nullable: true })
	userAgent: string | null;

	@ApiProperty({ nullable: true })
	revokedAt: Date | null;

	@ApiProperty()
	expiresAt: Date;

	@ApiProperty()
	createdAt: Date;
}

export class DeviceLogEntity {
	@ApiProperty()
	id: string;

	@ApiProperty()
	deviceId: string;

	@ApiProperty({ enum: DeviceEvent })
	event: DeviceEvent;

	@ApiProperty({ nullable: true })
	description: string | null;

	@ApiProperty({ nullable: true })
	metadata: Record<string, unknown> | null;

	@ApiProperty()
	createdAt: Date;
}

export class DeviceEntity {
	@ApiProperty()
	id: string;

	@ApiProperty()
	deviceId: string;

	@ApiProperty()
	hostname: string;

	@ApiProperty({ nullable: true })
	displayName: string | null;

	@ApiProperty({ enum: DeviceStatus })
	status: DeviceStatus;

	@ApiProperty({ nullable: true })
	serialNumber: string | null;

	@ApiProperty({ nullable: true })
	macAddress: string | null;

	@ApiProperty({ nullable: true })
	os: string | null;

	@ApiProperty({ nullable: true })
	appVersion: string | null;

	@ApiProperty({ nullable: true })
	companyId: string | null;

	@ApiProperty({ nullable: true })
	lastSeen: Date | null;

	@ApiProperty({ nullable: true })
	approvedAt: Date | null;

	@ApiProperty({ nullable: true })
	approvedBy: string | null;

	@ApiProperty({ nullable: true })
	blockedAt: Date | null;

	@ApiProperty({ nullable: true })
	blockedBy: string | null;

	@ApiProperty({ nullable: true })
	revokedAt: Date | null;

	@ApiProperty({ nullable: true })
	revokedBy: string | null;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}
