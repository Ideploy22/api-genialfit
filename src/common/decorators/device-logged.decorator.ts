import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import type { PropsDeviceLogado } from "@/types";

export const DeviceLogged = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): PropsDeviceLogado => {
		const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: PropsDeviceLogado }>();
		return request.user;
	},
);
