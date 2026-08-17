import { Module } from "@nestjs/common";
import { CloudgymClientService } from "./cloudgym-client.service";
import { CloudgymIntegrationController } from "./cloudgym-integration.controller";
import { CloudgymIntegrationService } from "./cloudgym-integration.service";
import { CloudgymWebhookController } from "./cloudgym-webhook.controller";
import { CloudgymWebhookService } from "./cloudgym-webhook.service";

@Module({
	controllers: [CloudgymIntegrationController, CloudgymWebhookController],
	providers: [
		CloudgymClientService,
		CloudgymIntegrationService,
		CloudgymWebhookService,
	],
	exports: [CloudgymClientService],
})
export class CloudgymModule {}
