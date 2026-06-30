import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		// In certain situations `httpAdapter` might not be available in the
		// constructor method, thus we should resolve it here.
		const { httpAdapter } = this.httpAdapterHost;

		const ctx = host.switchToHttp();

		const httpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const responseBody = {
			statusCode: httpStatus,
			timestamp: new Date().toISOString(),
			path: httpAdapter.getRequestUrl(ctx.getRequest()),
			message:
				exception instanceof HttpException
					? exception.message || exception.getResponse()
					: "Internal server error",
			error:
				exception instanceof HttpException
					? exception.name
					: "InternalServerError",
		};

		// Normalize message if it's an object from class-validator or similar
		if (exception instanceof HttpException) {
			const res = exception.getResponse();
			if (typeof res === "object" && res !== null && "message" in res) {
				responseBody.message = (res as { message: string | string[] }).message;
			}
		}

		this.logger.error(
			`Http Status: ${httpStatus} Error Message: ${JSON.stringify(responseBody.message)}`,
			exception instanceof Error ? exception.stack : "",
		);

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
