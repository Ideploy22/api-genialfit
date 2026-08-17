import { Body, Controller, Headers, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CloudgymWebhookService } from "./cloudgym-webhook.service";
import { CloudgymWebhookDto } from "./dto/cloudgym-webhook.dto";

@ApiTags("CloudGym — Webhook")
@Controller("cloudgym/webhook")
export class CloudgymWebhookController {
	constructor(private readonly service: CloudgymWebhookService) {}

	@Post()
	@ApiOperation({
		summary: "Receber eventos da CloudGym",
		description:
			"Endpoint chamado pela CloudGym quando membro/contrato/fatura muda. Autenticado por X-Webhook-Secret (configurado por empresa em /cloudgym/integration). Sempre responde 200 para evitar reenvio.",
	})
	handle(
		@Body() body: CloudgymWebhookDto & Record<string, unknown>,
		@Headers("x-webhook-secret") webhookSecret: string | undefined,
		@Query("companyId") companyId?: string,
	) {
		return this.service.handle(body, webhookSecret, companyId);
	}
}
