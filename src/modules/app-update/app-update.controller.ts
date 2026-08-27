import {
	BadRequestException,
	Controller,
	Get,
	Headers,
	Param,
	Post,
	Req,
	Res,
} from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiTags } from "@nestjs/swagger";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AppUpdateService } from "./app-update.service";

@ApiTags("App Update")
@Controller("app-update")
export class AppUpdateController {
	constructor(private readonly service: AppUpdateService) {}

	@Post("upload")
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: { type: "object", properties: { file: { type: "string", format: "binary" } } },
	})
	@ApiOperation({
		summary: "Publicar artefato de update",
		description:
			"Chamado só pelo CI ao cortar uma tag de versão. Autenticado por X-Update-Secret " +
			"(APP_UPDATE_SECRET no .env). Grava o arquivo no S3 com o nome original " +
			"(latest.yml, *.exe, *.exe.blockmap).",
	})
	async upload(
		@Req() req: FastifyRequest,
		@Headers("x-update-secret") secret: string | undefined,
	) {
		const file = await req.file();
		if (!file) throw new BadRequestException("Arquivo não enviado.");
		return this.service.uploadArtifact(file, secret);
	}

	@Get(":filename")
	@ApiOperation({
		summary: "Servir artefato de update",
		description:
			"Endpoint público lido pelo electron-updater (provider generic) do totem — " +
			"serve latest.yml e os arquivos que ele referencia (.exe, .exe.blockmap).",
	})
	@ApiProduces("application/octet-stream", "text/yaml")
	async serve(@Param("filename") filename: string, @Res() reply: FastifyReply) {
		const file = await this.service.getArtifact(filename);

		reply
			.header("Content-Type", file.contentType)
			.header("Content-Length", file.buffer.length)
			.header("Content-Disposition", `inline; filename="${file.fileName}"`)
			.header("Cache-Control", "no-cache")
			.send(file.buffer);
	}
}
