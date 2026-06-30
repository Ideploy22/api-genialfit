import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { ApiPaginatedResponse } from "@/common/decorators/api-paginated-response.decorator";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";
import { PageOptionsDto } from "@/common/dto/page-options.dto";
import { CompanyService } from "./company.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { Company } from "./entities/company.entity";

@UseGuards(JwtAuthGuard)
@Controller("company")
export class CompanyController {
	constructor(private readonly companyService: CompanyService) {}

	@Post()
	@ApiOperation({ summary: "Create", description: "Criar company" })
	@ApiStandardResponse({ path: "/company" })
	@ApiResponse({
		status: 201,
		description: "Retorno de um company criado",
		type: Company,
	})
	create(@Body() createCompanyDto: CreateCompanyDto) {
		return this.companyService.create(createCompanyDto);
	}

	//==========================================================
	@Get()
	@ApiOperation({ summary: "Read", description: "Listagem de company" })
	@ApiPaginatedResponse(Company)
	@ApiStandardResponse({ path: "/company" })
	findAll(@Query() pageOptionsDto: PageOptionsDto) {
		return this.companyService.findAll(pageOptionsDto);
	}

	//==========================================================
	@Get(":id")
	@ApiOperation({ summary: "Read by id", description: "Lista company" })
	@ApiStandardResponse({ path: "/company/:id" })
	@ApiResponse({
		status: 200,
		description: "Retorno de um company",
		type: Company,
	})
	findOne(@Param("id") id: string) {
		return this.companyService.findOne(id);
	}

	//==========================================================
	@Patch(":id")
	@ApiOperation({ summary: "Update", description: "Atualizar company" })
	@ApiStandardResponse({ path: "/company/:id" })
	@ApiResponse({
		status: 200,
		description: "Retorno de um company atualizado",
		type: Company,
	})
	update(@Param("id") id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
		return this.companyService.update(id, updateCompanyDto);
	}

	//==========================================================
	@Delete(":id")
	@ApiOperation({ summary: "Delete", description: "Remover company" })
	@ApiStandardResponse({ path: "/company/:id" })
	remove(@Param("id") id: string) {
		return this.companyService.remove(id);
	}
}
