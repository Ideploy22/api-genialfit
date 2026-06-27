import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João', description: 'Nome do usuário' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@teste.com', description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha do usuário' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    type: 'string',
    required: false,
    format: 'binary',
    description: 'Imagem do avatar',
  })
  @IsOptional()
  avatar?: File;
}
