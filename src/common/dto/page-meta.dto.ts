import { ApiProperty } from "@nestjs/swagger";
import { PageOptionsDto } from "./page-options.dto";

export interface PageMetaDtoParameters {
	pageOptionsDto: PageOptionsDto;
	itemCount: number;
}

export class PageMetaDto {
	@ApiProperty()
	readonly page: number;

	@ApiProperty()
	readonly take: number;

	@ApiProperty()
	readonly itemCount: number;

	@ApiProperty()
	readonly pageCount: number;

	@ApiProperty()
	readonly hasPrevious: boolean;

	@ApiProperty()
	readonly hasNext: boolean;

	constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
		this.page = pageOptionsDto.all ? 1 : (pageOptionsDto.page ?? 1);
		this.take = pageOptionsDto.all ? itemCount : (pageOptionsDto.take ?? 10);
		this.itemCount = itemCount;
		this.pageCount = pageOptionsDto.all
			? 1
			: Math.ceil(this.itemCount / this.take);
		this.hasPrevious = pageOptionsDto.all ? false : this.page > 1;
		this.hasNext = pageOptionsDto.all ? false : this.page < this.pageCount;
	}
}
