import { ApiProperty } from "@nestjs/swagger";

/**
 * Nunca expõe passwordEncrypted nem accessToken — são segredos internos
 * usados só pelo CloudgymClientService.
 */
export class CloudgymIntegrationEntity {
	@ApiProperty()
	id: string;

	@ApiProperty()
	companyId: string;

	@ApiProperty()
	unitId: number;

	@ApiProperty({ required: false, nullable: true })
	baseUrl: string | null;

	@ApiProperty()
	username: string;

	@ApiProperty()
	active: boolean;

	@ApiProperty({ required: false, nullable: true })
	accessTokenExpiresAt: Date | null;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}
