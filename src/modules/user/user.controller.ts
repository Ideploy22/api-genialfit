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
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";

@UseGuards(JwtAuthGuard)
@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	@ApiOperation({ summary: "Create", description: "Criar user" })
	@ApiStandardResponse({ path: "/user" })
	@ApiResponse({
		status: 201,
		description: "Retorno de um user criado",
		type: User,
	})
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	//==========================================================
	//ROTA PUBLICA
	@Get()
	@ApiOperation({ summary: "Read", description: "Listagem de user" })
	@ApiPaginatedResponse(User)
	@ApiStandardResponse({ path: "/user" })
	findAll(@Query() pageOptionsDto: PageOptionsDto) {
		return this.userService.findAll(pageOptionsDto);
	}

	//==========================================================
	//ROTA PUBLICA
	@Get(":id")
	@ApiOperation({ summary: "Read by id", description: "Lista user" })
	@ApiStandardResponse({ path: "/user/:id" })
	@ApiResponse({ status: 200, description: "Retorno de um user", type: User })
	findOne(@Param("id") id: number) {
		return this.userService.findOne(id);
	}

	//==========================================================

	@Patch(":id")
	@ApiOperation({ summary: "Update", description: "Atualizar user" })
	@ApiStandardResponse({ path: "/user/:id" })
	@ApiResponse({
		status: 200,
		description: "Retorno de um user atualizado",
		type: User,
	})
	update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(id, updateUserDto);
	}

	//==========================================================

	@Delete(":id")
	@ApiOperation({ summary: "Delete", description: "Remover user" })
	@ApiStandardResponse({ path: "/user/:id" })
	remove(@Param("id") id: number) {
		return this.userService.remove(id);
	}
}
