import {
	createCipheriv,
	createDecipheriv,
	createHash,
	randomBytes,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/**
 * Deriva uma chave de 32 bytes a partir de CRYPTO_SECRET via SHA-256, para
 * aceitar qualquer tamanho de secret na env sem quebrar o AES-256.
 */
function getKey(): Buffer {
	const secret = process.env.CRYPTO_SECRET;
	if (!secret) {
		throw new Error("CRYPTO_SECRET não configurada.");
	}
	return createHash("sha256").update(secret).digest();
}

/**
 * Criptografa um texto com AES-256-GCM. Usado para credenciais de terceiros
 * (ex.: senha da integração CloudGym) que precisam ser recuperadas em texto
 * puro para autenticar em outra API — por isso não pode ser um hash one-way.
 */
export function encrypt(plainText: string): string {
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, getKey(), iv);
	const encrypted = Buffer.concat([
		cipher.update(plainText, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();

	return [iv, authTag, encrypted]
		.map((buffer) => buffer.toString("base64"))
		.join(".");
}

export function decrypt(cipherText: string): string {
	const [ivB64, authTagB64, encryptedB64] = cipherText.split(".");
	if (!ivB64 || !authTagB64 || !encryptedB64) {
		throw new Error("Formato de texto criptografado inválido.");
	}

	const decipher = createDecipheriv(
		ALGORITHM,
		getKey(),
		Buffer.from(ivB64, "base64"),
	);
	decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

	const decrypted = Buffer.concat([
		decipher.update(Buffer.from(encryptedB64, "base64")),
		decipher.final(),
	]);

	return decrypted.toString("utf8");
}
