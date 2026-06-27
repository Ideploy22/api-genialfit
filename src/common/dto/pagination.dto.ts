import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Número da página', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filtros de busca dinâmica',
    example: { name: 'João' },
    type: Object,
  })
  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    // Se for string (caso venha diretamente como JSON), tenta converter
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return {}; // Se falhar, retorna um objeto vazio
      }
    }
    return value;
  })
  search?: Record<string, string>;
}
