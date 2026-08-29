import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, s3Client } from "@/common/s3";

const SUB = "app-updates";
/** Casa "genial-fit-1.0.4-setup.exe" e "genial-fit-1.0.4-setup.exe.blockmap" — ver artifactName no electron-builder.yml. */
const VERSION_FROM_FILENAME = /-(\d+\.\d+\.\d+)-setup\.exe/;

export interface AppUpdateArtifact {
	key: string;
	filename: string;
	version: string | null;
	size: number;
	lastModified: string | null;
}

@Injectable()
export class AppUpdateService {
	// Instaladores passam de 100MB — enviá-los via multipart pela nossa API
	// bate no limite de upload do Cloudflare (que fica na frente da API), que
	// rejeita corpo de requisição > 100MB com 413. Uma URL pré-assinada manda
	// o arquivo direto pro S3/R2, sem passar pela nossa API nem pelo Cloudflare.
	// Usado pelo script de release (scripts/publish-update.mjs) — autenticado
	// por secret compartilhado, não por sessão de usuário.
	async getUploadUrl(filename: string, secret: string | undefined) {
		if (!secret || secret !== process.env.APP_UPDATE_SECRET) {
			throw new UnauthorizedException("Secret de update inválido.");
		}
		return this.presignPut(filename);
	}

	/** Mesma URL pré-assinada de cima, mas pro upload manual feito pelo admin logado (web-genialfit) — autenticação já veio do JwtAuthGuard na rota, não precisa do secret. */
	async getAdminUploadUrl(filename: string) {
		return this.presignPut(filename);
	}

	private async presignPut(filename: string) {
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

	/**
	 * Lista tudo que já foi publicado (todo .exe/.blockmap de toda versão que
	 * já passou por aqui, o bucket nunca limpa os antigos) e separa qual
	 * versão é a "atual" de verdade — a que o electron-updater dos totens vai
	 * de fato baixar, lida do latest.yml, não a mais recente por data.
	 */
	async listVersions(): Promise<{
		currentVersion: string | null;
		currentReleaseDate: string | null;
		artifacts: AppUpdateArtifact[];
	}> {
		const client = s3Client();
		const listRes = await client.send(
			new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET, Prefix: `${SUB}/` }),
		);

		const artifacts: AppUpdateArtifact[] = (listRes.Contents ?? [])
			.filter((obj) => obj.Key && obj.Key !== `${SUB}/`)
			.map((obj) => {
				const filename = obj.Key!.slice(SUB.length + 1);
				return {
					key: obj.Key!,
					filename,
					version: filename.match(VERSION_FROM_FILENAME)?.[1] ?? null,
					size: obj.Size ?? 0,
					lastModified: obj.LastModified?.toISOString() ?? null,
				};
			})
			.sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? ""));

		const current = await this.getCurrentVersion();
		return { ...current, artifacts };
	}

	/**
	 * `latest.yml` é o manifesto que o electron-updater (provider generic) lê
	 * pra saber a versão vigente — parse manual de 2 campos escalares em vez
	 * de puxar uma lib de YAML só pra isso.
	 */
	private async getCurrentVersion(): Promise<{
		currentVersion: string | null;
		currentReleaseDate: string | null;
	}> {
		try {
			const { buffer } = await s3().getBuffer("latest.yml", SUB);
			const text = buffer.toString("utf-8");
			return {
				currentVersion: text.match(/^version:\s*(.+)$/m)?.[1]?.trim() ?? null,
				currentReleaseDate:
					text.match(/^releaseDate:\s*['"]?([^'"\n]+)/m)?.[1]?.trim() ?? null,
			};
		} catch {
			return { currentVersion: null, currentReleaseDate: null };
		}
	}
}
