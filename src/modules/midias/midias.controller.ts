import {
	Controller,
	Get,
	NotFoundException,
	Param,
	Query,
	Res,
} from "@nestjs/common";
import {
	ApiNotFoundResponse,
	ApiOperation,
	ApiProduces,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { FastifyReply } from "fastify";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";
import { MidiasService } from "./midias.service";

@ApiTags("Midias")
@Controller("midias")
export class MidiasController {
	constructor(private readonly midiasService: MidiasService) {}

	@Get(":key")
	@ApiOperation({
		summary: "Servir mídia",
		description:
			"Retorna o conteúdo binário do arquivo diretamente, sem expor a URL do S3. " +
			"Use `sub` para indicar a subpasta no bucket (ex: central-aviso, paineis). " +
			"Use `r2=true` para buscar no Cloudflare R2 em vez do S3 padrão.",
	})
	@ApiQuery({
		name: "sub",
		required: false,
		description: "Subpasta no bucket (ex: central-aviso, paineis, processos)",
		example: "central-aviso",
	})
	@ApiQuery({
		name: "r2",
		required: false,
		description: "Usar Cloudflare R2 em vez do S3 padrão",
		example: false,
	})
	@ApiProduces(
		"image/jpeg",
		"image/png",
		"image/webp",
		"video/mp4",
		"application/octet-stream",
	)
	@ApiResponse({
		status: 200,
		description: "Conteúdo binário do arquivo com Content-Type correto",
		headers: {
			"Content-Type": {
				description: "Tipo do arquivo retornado",
				schema: { type: "string", example: "image/jpeg" },
			},
			"Cache-Control": {
				description: "Política de cache",
				schema: { type: "string", example: "public, max-age=3600" },
			},
		},
	})
	@ApiNotFoundResponse({ description: "Arquivo não encontrado no storage" })
	@ApiStandardResponse({ path: "/midias/:key" })
	async serve(
		@Param("key") key: string,
		@Query("sub") sub: string = "",
		@Query("r2") r2: string = "false",
		@Res() reply: FastifyReply,
	) {
		const file = await this.midiasService.getFile(key, sub, r2 === "true");

		if (!file) {
			throw new NotFoundException("Mídia não encontrada");
		}

		reply
			.header("Content-Type", file.contentType)
			.header("Content-Length", file.buffer.length)
			.header("Content-Disposition", `inline; filename="${file.fileName}"`)
			.header("Cache-Control", "public, max-age=3600")
			.send(file.buffer);
	}
}
