import { BadRequestException, Controller, Get, Headers, Param, Query, Res } from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiQuery, ApiTags } from "@nestjs/swagger";
import type { FastifyReply } from "fastify";
import { AppUpdateService } from "./app-update.service";

@ApiTags("App Update")
@Controller("app-update")
export class AppUpdateController {
	constructor(private readonly service: AppUpdateService) {}

	@Get("upload-url")
	@ApiOperation({
		summary: "Gerar URL pré-assinada pra publicar um artefato de update",
		description:
			"Chamado só pelo processo de release (local ou CI). Autenticado por X-Update-Secret " +
			"(APP_UPDATE_SECRET no .env). Devolve uma URL de PUT direta pro S3/R2, válida por 10 " +
			"minutos — o arquivo (latest.yml, *.exe, *.exe.blockmap) é enviado direto pro bucket, " +
			"sem passar pela API (instaladores passam do limite de upload do Cloudflare).",
	})
	@ApiQuery({ name: "filename", required: true, example: "genial-fit-1.0.1-setup.exe" })
	async getUploadUrl(
		@Query("filename") filename: string,
		@Headers("x-update-secret") secret: string | undefined,
	) {
		if (!filename) throw new BadRequestException("filename é obrigatório.");
		return this.service.getUploadUrl(filename, secret);
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
