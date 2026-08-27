import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, s3Client } from "@/common/s3";

const SUB = "app-updates";

@Injectable()
export class AppUpdateService {
	// Instaladores passam de 100MB — enviá-los via multipart pela nossa API
	// bate no limite de upload do Cloudflare (que fica na frente da API), que
	// rejeita corpo de requisição > 100MB com 413. Uma URL pré-assinada manda
	// o arquivo direto pro S3/R2, sem passar pela nossa API nem pelo Cloudflare.
	async getUploadUrl(filename: string, secret: string | undefined) {
		if (!secret || secret !== process.env.APP_UPDATE_SECRET) {
			throw new UnauthorizedException("Secret de update inválido.");
		}

		const command = new PutObjectCommand({
			Bucket: process.env.S3_BUCKET,
			Key: `${SUB}/${filename}`,
		});
		const url = await getSignedUrl(s3Client(), command, { expiresIn: 600 });
		return { url };
	}

	async getArtifact(filename: string) {
		try {
			return await s3().getBuffer(filename, SUB);
		} catch {
			throw new NotFoundException("Artefato de update não encontrado.");
		}
	}
}
