import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FastifyReply } from 'fastify';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let statusCode = HttpStatus.BAD_REQUEST;
    let message = 'Erro desconhecido';

    switch (exception.code) {
      case 'P2000':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `O valor fornecido para '${exception.meta?.target}' é muito longo.`;
        break;
      case 'P2002':
        statusCode = HttpStatus.CONFLICT;
        message = `O valor para '${exception.meta?.target}' já está em uso.`;
        break;
      case 'P2003':
        statusCode = HttpStatus.BAD_REQUEST;
        message =
          'Não é possível excluir ou modificar devido a uma referência em outro registro.';
        break;
      case 'P2005':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `O formato do valor fornecido para '${exception.meta?.target}' é inválido.`;
        break;
      case 'P2011':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `O campo '${exception.meta?.target}' não pode ser nulo.`;
        break;
      case 'P2012':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `O campo obrigatório '${exception.meta?.target}' está faltando.`;
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado.';
        break;
      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Erro interno do servidor.';
        break;
    }
    reply.status(statusCode).send({ statusCode, message });
  }
}
