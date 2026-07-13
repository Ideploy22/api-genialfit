import { Injectable, NotFoundException } from "@nestjs/common";
import { s3 } from "@/common/s3";

@Injectable()
export class MidiasService {
	async getFile(key: string, sub: string = "", useR2: boolean = false) {
		try {
			const file = await s3(useR2).getBuffer(key, sub);
			return file;
		} catch {
			throw new NotFoundException("Mídia não encontrada");
		}
	}
}
