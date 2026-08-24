import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";
import { CloudgymClientService } from "./cloudgym-client.service";
import { CloudgymIntegrationService } from "./cloudgym-integration.service";
import { DiscoverCloudgymUnitsDto } from "./dto/discover-cloudgym-units.dto";
import { CreateCloudgymIntegrationDto } from "./dto/create-cloudgym-integration.dto";
import { UpdateCloudgymIntegrationDto } from "./dto/update-cloudgym-integration.dto";
import { CloudgymIntegrationEntity } from "./entities/cloudgym-integration.entity";

@ApiTags("CloudGym — Integração")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller("cloudgym/integration")
export class CloudgymIntegrationController {
	constructor(
		private readonly service: CloudgymIntegrationService,
		private readonly cloudgymClient: CloudgymClientService,
	) {}

	@Post("discover-units")
	@ApiOperation({
		summary: "Listar unidades da conta CloudGym a partir de usuário/senha",
		description:
			"Autentica direto na CloudGym com as credenciais informadas e devolve as unidades da conta (id numérico + nome) — não salva nada. Usado no formulário do admin pra achar o unitId certo sem precisar caçar no painel da CloudGym.",
	})
	discoverUnits(@Body() dto: DiscoverCloudgymUnitsDto) {
		return this.cloudgymClient.discoverUnits(dto.username, dto.password, dto.baseUrl);
	}

	@Post()
	@ApiOperation({
		summary: "Configurar integração CloudGym de uma empresa",
		description:
			"Vincula unitId + credenciais da CloudGym a uma Company. Usado pelo admin (web-genialfit).",
	})
	@ApiResponse({ status: 201, type: CloudgymIntegrationEntity })
	create(@Body() dto: CreateCloudgymIntegrationDto) {
		return this.service.create(dto);
	}

	@Get(":companyId")
	@ApiOperation({ summary: "Buscar integração CloudGym por empresa" })
	@ApiResponse({ status: 200, type: CloudgymIntegrationEntity })
	@ApiStandardResponse({ path: "/cloudgym/integration/:companyId" })
	findByCompany(@Param("companyId") companyId: string) {
		return this.service.findByCompany(companyId);
	}

	@Patch(":companyId")
	@ApiOperation({ summary: "Atualizar integração CloudGym de uma empresa" })
	@ApiResponse({ status: 200, type: CloudgymIntegrationEntity })
	@ApiStandardResponse({ path: "/cloudgym/integration/:companyId" })
	update(
		@Param("companyId") companyId: string,
		@Body() dto: UpdateCloudgymIntegrationDto,
	) {
		return this.service.update(companyId, dto);
	}

	@Delete(":companyId")
	@ApiOperation({ summary: "Remover integração CloudGym de uma empresa" })
	@ApiStandardResponse({ path: "/cloudgym/integration/:companyId" })
	remove(@Param("companyId") companyId: string) {
		return this.service.remove(companyId);
	}
}
