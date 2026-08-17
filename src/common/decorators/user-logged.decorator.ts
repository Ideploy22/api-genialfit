import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import type { PropsUserLogado } from "@/types";

export const UserLogged = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): PropsUserLogado => {
		const request = ctx
			.switchToHttp()
			.getRequest<FastifyRequest & { user: PropsUserLogado }>();
		return request.user;
	},
);
