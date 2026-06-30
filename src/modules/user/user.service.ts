import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PageDto } from "@/common/dto/page.dto";
import { PageMetaDto } from "@/common/dto/page-meta.dto";
import { PageOptionsDto } from "@/common/dto/page-options.dto";
import { PrismaService } from "@/database/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	create(createUserDto: CreateUserDto): Promise<User> {
		return this.prisma.user.create({
			data: createUserDto,
		});
	}

	async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<User>> {
		const where: Prisma.UserWhereInput = {};
		const allowedFields = ["id"];

		if (pageOptionsDto.search) {
			if (!allowedFields.includes(pageOptionsDto.search.field)) {
				throw new BadRequestException(
					`Campo inválido: "${pageOptionsDto.search.field}". Campos permitidos: ${allowedFields.join(", ")}`,
				);
			} else {
				where[pageOptionsDto.search.field] = {
					contains: pageOptionsDto.search.value,
					mode: "insensitive",
				};
			}
		}

		const [items, itemCount] = await Promise.all([
			this.prisma.user.findMany({
				where,
				skip: pageOptionsDto.skip,
				take: pageOptionsDto.all ? undefined : pageOptionsDto.take,
				select: {
					name: true,
					email: true,
					role: true,
				},
				orderBy: {
					id: pageOptionsDto.order,
				},
			}) as unknown as User[],
			this.prisma.user.count({ where }),
		]);

		const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
		return new PageDto(items, pageMetaDto);
	}

	async findOne(id: number) {
		const item = await this.prisma.user.findUnique({
			where: { id },
			select: {
				name: true,
				email: true,
				role: true,
			},
		});
		if (!item) {
			throw new NotFoundException("User não encontrado");
		}
		return item;
	}

	async findByEmail(email: string) {
		const item = await this.prisma.user.findUnique({
			where: { email },
		});
		if (!item) {
			throw new NotFoundException("User não encontrado");
		}
		return item;
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		const item = await this.prisma.user.findUnique({
			where: { id },
		});
		if (!item) {
			throw new NotFoundException("User não encontrado");
		}
		return this.prisma.user.update({
			where: { id },
			data: updateUserDto,
		});
	}

	async remove(id: number) {
		const item = await this.prisma.user.findUnique({
			where: { id },
		});
		if (!item) {
			throw new NotFoundException("User não encontrado");
		}
		return this.prisma.user.delete({
			where: { id },
		});
	}
}
