import { Module } from "@nestjs/common";
import { MidiasController } from "./midias.controller";
import { MidiasService } from "./midias.service";

@Module({
	controllers: [MidiasController],
	providers: [MidiasService],
})
export class MidiasModule {}
