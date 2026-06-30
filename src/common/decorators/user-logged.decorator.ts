import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";

export const UserLogged = createParamDecorator(
	(_: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<FastifyRequest>();
		return request.userLogged;
	},
);
