import { ApiProperty } from "@nestjs/swagger";

/** Formato consumido pelo totem (ver genialfit/src/renderer/src/pages/home/index.tsx). */
export class BannerEntity {
	@ApiProperty()
	id: string;

	@ApiProperty({ required: false, nullable: true })
	title: string | null;

	@ApiProperty({ required: false, nullable: true })
	description: string | null;

	@ApiProperty()
	image: string;
}
