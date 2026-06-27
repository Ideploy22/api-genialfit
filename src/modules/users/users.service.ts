import { PaginationResponseDto } from '@/common/dto/pagination-resp.dto';
import { validatePrismaFields } from '@/common/utils/prisma-validator';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: { [key: string]: string }) {
    const skip = (page - 1) * limit;

    validatePrismaFields(Prisma.UserScalarFieldEnum, search);

    const where = search
      ? Object.keys(search).reduce((acc, key) => {
          acc[key] = { contains: search[key], mode: 'insensitive' };
          return acc;
        }, {})
      : {};

    const users = await this.prisma.user.findMany({
      where,
      skip,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      take: limit,
    });

    const total = await this.prisma.user.count({ where });

    return new PaginationResponseDto(users, total, page, limit);
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        avatar: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: { name: string; email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      select: {
        name: true,
        email: true,
        avatar: true,
      },
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async update(
    data: {
      name: string;
      email: string;
      password: string;
    },
    id: number,
  ) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.update({
      where: { id },
      select: {
        name: true,
        email: true,
      },
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
