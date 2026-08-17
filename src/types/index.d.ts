import { Role } from "@prisma/client";

export interface PropsUserLogado {
	name: string;
	role: Role;
}

export interface PropsDeviceLogado {
	deviceId: string;          // id interno (cuid)
	externalDeviceId: string;  // UUID do Electron
	companyId: string | null;
}

export interface PropsMemberLogado {
	memberId: string;
	companyId: string;
	deviceId: string;
}
