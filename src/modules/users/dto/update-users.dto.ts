import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João', description: 'Nome do usuário' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'joao@teste.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '123456', description: 'Senha do usuário' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
