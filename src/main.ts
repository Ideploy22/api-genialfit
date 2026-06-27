import * as fastifySwagger from '@fastify/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import Default from './config/configuration';

import multipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: Default().envToLogger[process.env.NODE_ENV],
    }),
  );
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const config = new DocumentBuilder()
    .setTitle('Minha API')
    .setDescription('Documentação da API usando Fastify')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  await app.register(fastifySwagger);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.register(multipart);

  await app.listen(4000, '0.0.0.0');
}
bootstrap();
