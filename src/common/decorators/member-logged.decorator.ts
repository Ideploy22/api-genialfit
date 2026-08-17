import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import type { PropsMemberLogado } from "@/types";

export const MemberLogged = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): PropsMemberLogado => {
		const request = ctx
			.switchToHttp()
			.getRequest<FastifyRequest & { user: PropsMemberLogado }>();
		return request.user;
	},
);
