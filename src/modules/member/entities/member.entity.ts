import { ApiProperty } from "@nestjs/swagger";

export class MemberProfileEntity {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;

	@ApiProperty({ required: false, nullable: true })
	avatar: string | null;

	@ApiProperty()
	points: number;

	@ApiProperty({ required: false, nullable: true })
	planName: string | null;

	@ApiProperty({ required: false, nullable: true, example: 10 })
	dueDay: number | null;
}
