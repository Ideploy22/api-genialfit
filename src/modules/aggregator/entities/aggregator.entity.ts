import { ApiProperty } from "@nestjs/swagger";
import { AggregatorProvider } from "@prisma/client";

export class AggregatorEntity {
	@ApiProperty()
	id: string;

	@ApiProperty({ enum: AggregatorProvider })
	provider: AggregatorProvider;

	@ApiProperty()
	active: boolean;
}
