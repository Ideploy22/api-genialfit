import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { s3Helper } from '@/common/utils/s3.helper';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(
      query.page || 0,
      query.limit || 0,
      query.search,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Criação de usuário com avatar',
    type: CreateUserDto,
  })
  @Post()
  async create(@Req() req: FastifyRequest) {
    const fileAvatar = await req.file();

    // Extrai os campos corretamente do form-data
    const fields: any = Object.fromEntries(
      Object.entries(fileAvatar?.fields || {}).map(([key, field]: any) => [
        key,
        field?.value,
      ]),
    );

    let avatar = '';
    if (fileAvatar) {
      avatar = (await s3Helper.post(fileAvatar, 'teste')) || '';
    }

    return this.usersService.create({
      ...fields,
      avatar,
    });
  }

  @ApiConsumes('multipart/form-data')
  @Put(':id')
  async update(@Body() user: UpdateUserDto, @Param('id') id: string) {
    return this.usersService.update({ ...user }, Number(id));
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(Number(id));
  }
}
