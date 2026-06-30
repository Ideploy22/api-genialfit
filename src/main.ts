import multipart from "@fastify/multipart";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import { Server } from "socket.io";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";
import Default from "./config/configuration";
import { PropsUserLogado } from "./types";

declare module "fastify" {
	interface FastifyInstance {
		io: Server;
	}

	interface FastifyRequest {
		userLogged: PropsUserLogado;
	}

	interface RouteOptions {
		config?: { reference: string };
	}
}

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
		.setTitle("Genialfit API")
		.setDescription("Documentação da API")
		.setVersion("1.0")
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);

	const fastify = app.getHttpAdapter().getInstance();
	await fastify.register(ScalarApiReference, {
		routePrefix: "/docs",
		configuration: {
			content: document,
		},
	});

	app.useGlobalFilters(new PrismaExceptionFilter());

	await app.register(multipart);

	await app.listen(process.env.PORT || 4000, "0.0.0.0");
}
bootstrap();
