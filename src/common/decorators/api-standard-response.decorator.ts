import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "../dto/error-response.dto";

interface ApiStandardResponseOptions {
	path?: string;
}

export function ApiStandardResponse(options: ApiStandardResponseOptions = {}) {
	const pathExample = options.path || "/path";

	return applyDecorators(
		ApiResponse({
			status: 400,
			description: "Bad Request",
			example: {
				statusCode: 400,
				timestamp: "2025-12-16T15:30:00.000Z",
				path: pathExample,
				message: "Bad Request Exception",
				error: "BadRequestException",
			},
			type: ErrorResponseDto,
			schema: {
				allOf: [
					{
						properties: {
							statusCode: { example: 400 },
							timestamp: { example: "2025-12-16T15:30:00.000Z" },
							path: { example: pathExample },
							message: { example: "Bad Request Exception" },
							error: { example: "BadRequestException" },
						},
					},
				],
			},
		}),
		ApiResponse({
			status: 401,
			description: "Unauthorized",
			example: {
				statusCode: 401,
				timestamp: "2025-12-16T15:30:00.000Z",
				path: pathExample,
				message: "Unauthorized",
				error: "Unauthorized",
			},
			type: ErrorResponseDto,
			schema: {
				allOf: [
					{
						properties: {
							statusCode: { example: 401 },
							timestamp: { example: "2025-12-16T15:30:00.000Z" },
							path: { example: pathExample },
							message: { example: "Unauthorized" },
							error: { example: "Unauthorized" },
						},
					},
				],
			},
		}),
		ApiResponse({
			status: 403,
			description: "Forbidden",
			example: {
				statusCode: 403,
				timestamp: "2025-12-16T15:30:00.000Z",
				path: pathExample,
				message: "Forbidden resource",
				error: "Forbidden",
			},
			type: ErrorResponseDto,
			schema: {
				allOf: [
					{
						properties: {
							statusCode: { example: 403 },
							timestamp: { example: "2025-12-16T15:30:00.000Z" },
							path: { example: pathExample },
							message: { example: "Forbidden resource" },
							error: { example: "Forbidden" },
						},
					},
				],
			},
		}),
		ApiResponse({
			status: 404,
			description: "Not Found",
			example: {
				statusCode: 404,
				timestamp: "2025-12-16T15:30:00.000Z",
				path: pathExample,
				message: "Not Found",
				error: "NotFound",
			},
			type: ErrorResponseDto,
			schema: {
				allOf: [
					{
						properties: {
							statusCode: { example: 404 },
							timestamp: { example: "2025-12-16T15:30:00.000Z" },
							path: { example: pathExample },
							message: { example: "Not Found" },
							error: { example: "NotFound" },
						},
					},
				],
			},
		}),
		ApiResponse({
			status: 500,
			description: "Internal Server Error",
			example: {
				statusCode: 500,
				timestamp: "2025-12-16T15:30:00.000Z",
				path: pathExample,
				message: "Internal server error",
				error: "InternalServerError",
			},
			type: ErrorResponseDto,
			schema: {
				allOf: [
					{
						properties: {
							statusCode: { example: 500 },
							timestamp: { example: "2025-12-16T15:30:00.000Z" },
							path: { example: pathExample },
							message: { example: "Internal server error" },
							error: { example: "InternalServerError" },
						},
					},
				],
			},
		}),
	);
}
