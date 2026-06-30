import type { Readable } from "node:stream";
import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ForbiddenException } from "@nestjs/common";
import { v4 as uuid } from "uuid";

let s3ClientInstance: S3Client | null = null;
let r2ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
	if (!s3ClientInstance) {
		s3ClientInstance = new S3Client({
			endpoint: process.env.S3,
			region: "us-east-1",
			credentials: {
				accessKeyId: process.env.S3_AKEY!,
				secretAccessKey: process.env.S3_SKEY!,
			},
			forcePathStyle: process.env.S3_STYLE === "true",
		});
	}
	return s3ClientInstance;
}

function getR2Client(): S3Client {
	if (!r2ClientInstance) {
		r2ClientInstance = new S3Client({
			endpoint: process.env.R2,
			region: "auto",
			credentials: {
				accessKeyId: process.env.R2_AKEY!,
				secretAccessKey: process.env.R2_SKEY!,
			},
		});
	}
	return r2ClientInstance;
}

// Exportar para compatibilidade com testes
export { getS3Client as s3Client };

export function s3(r2 = false): {
	get: (
		Key: string,
		sub?: string,
		time?: number,
	) => Promise<{
		uid: string;
		name: string;
		status: string;
		url: string;
	}>;
	getBuffer: (
		Key: string,
		sub?: string,
	) => Promise<{
		buffer: Buffer;
		contentType: string;
		fileName: string;
	}>;
	post: (file: File, sub?: string) => Promise<string>;
	del: (Key: string) => Promise<unknown>;
	getUrl: (Key: string, sub?: string, time?: number) => Promise<string>;
	getSize: (Key: string, sub?: string) => Promise<number>;
} {
	try {
		const client = r2 ? getR2Client() : getS3Client();
		const bucketName = r2 ? process.env.R2_BUCKET : process.env.S3_BUCKET;

		const get = async (Key: string, sub = "", time = 3600) => {
			const keyFolder = `${sub.length > 0 ? `${sub}/` : ""}${Key}`;

			const indexObj = new GetObjectCommand({
				Bucket: bucketName,
				Key: keyFolder,
			});

			const signedUrl = await getSignedUrl(client, indexObj, {
				expiresIn: time,
			});

			return {
				uid: Key,
				name: Key,
				status: "done",
				url: signedUrl,
			};
		};

		const getBuffer = async (Key: string, sub = "") => {
			const keyFolder = `${sub.length > 0 ? `${sub}/` : ""}${Key}`;

			const getObj = new GetObjectCommand({
				Bucket: bucketName,
				Key: keyFolder,
			});

			const response = await client.send(getObj);

			if (!response.Body) {
				throw new ForbiddenException("Arquivo não encontrado");
			}

			const chunks: Uint8Array[] = [];
			const stream = response.Body as Readable;

			return new Promise<{
				buffer: Buffer;
				contentType: string;
				fileName: string;
			}>((resolve, reject) => {
				stream.on("data", (chunk: Uint8Array) => {
					chunks.push(chunk);
				});

				stream.on("end", () => {
					const buffer = Buffer.concat(chunks);
					resolve({
						buffer,
						contentType: response.ContentType || "application/octet-stream",
						fileName: Key,
					});
				});

				stream.on("error", (error: unknown) => {
					reject(error);
				});
			});
		};

		const getUrl = async (Key: string, sub = "", time = 3600) => {
			const keyFolder = `${sub.length > 0 ? `${sub}/` : ""}${Key}`;

			const indexObj = new GetObjectCommand({
				Bucket: bucketName,
				Key: keyFolder,
			});

			const signedUrl = await getSignedUrl(client, indexObj, {
				expiresIn: time,
			});

			return signedUrl;
		};

		const post = async (file: File, sub = "") => {
			if (!file) {
				throw new ForbiddenException("File is required");
			}

			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const extension = file.type.split("/").pop();
			const name = `${uuid()}.${extension}`;
			const fileName = `${sub.length > 0 ? `${sub}/` : ""}${name}`;

			const putObj = new PutObjectCommand({
				Bucket: bucketName,
				Key: fileName,
				Body: buffer,
				ContentType: file.type || "application/octet-stream",
				ContentDisposition: "inline",
			});

			await client.send(putObj);
			return name;
		};

		const del = async (Key: string) => {
			if (Key) {
				const deleteObj = new DeleteObjectCommand({
					Bucket: bucketName,
					Key,
				});
				const res = await client.send(deleteObj);

				return res;
			}
			return null;
		};

		const getSize = async (Key: string, sub = "") => {
			const keyFolder = `${sub.length > 0 ? `${sub}/` : ""}${Key}`;

			const headObj = new HeadObjectCommand({
				Bucket: bucketName,
				Key: keyFolder,
			});

			const response = await client.send(headObj);
			return response.ContentLength ?? 0;
		};

		return { get, getBuffer, post, del, getUrl, getSize };
	} catch (err) {
		return err;
	}
}
