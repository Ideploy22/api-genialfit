import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import type { MultipartFile } from "@fastify/multipart";
import { s3, s3Client } from "@/common/s3";

const SUB = "app-updates";

@Injectable()
export class AppUpdateService {
	async uploadArtifact(file: MultipartFile, secret: string | undefined) {
		if (!secret || secret !== process.env.APP_UPDATE_SECRET) {
			throw new UnauthorizedException("Secret de update inválido.");
		}

		const buffer = await file.toBuffer();

		await s3Client().send(
			new PutObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: `${SUB}/${file.filename}`,
				Body: buffer,
				ContentType: file.mimetype || "application/octet-stream",
			}),
		);

		return { filename: file.filename, size: buffer.length };
	}

	async getArtifact(filename: string) {
		try {
			return await s3().getBuffer(filename, SUB);
		} catch {
			throw new NotFoundException("Artefato de update não encontrado.");
		}
	}
}
