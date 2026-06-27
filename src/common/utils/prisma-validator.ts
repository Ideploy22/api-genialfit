import { BadRequestException } from '@nestjs/common';

/**
 * Valida se os campos de busca existem no modelo do Prisma.
 * @param model Enum do Prisma contendo os campos válidos.
 * @param search Objeto de busca enviado na requisição.
 */
export function validatePrismaFields(
  model: Record<string, string>,
  search?: Record<string, string>,
) {
  if (search) {
    const validFields = Object.values(model);

    for (const key of Object.keys(search)) {
      if (!validFields.includes(key)) {
        throw new BadRequestException(`O campo '${key}' não existe no modelo.`);
      }
    }
  }
}
