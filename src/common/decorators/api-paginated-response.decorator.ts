import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { PageDto } from "../dto/page.dto";
import { PageMetaDto } from "../dto/page-meta.dto";

export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
	model: TModel,
) => {
	return applyDecorators(
		ApiExtraModels(PageDto, model),
		ApiOkResponse({
			description: "Lista de modelos recebida com sucesso.",
			schema: {
				allOf: [
					{ $ref: getSchemaPath(PageDto) },
					{
						properties: {
							items: {
								type: "array",
								items: { $ref: getSchemaPath(model) },
							},
							meta: { $ref: getSchemaPath(PageMetaDto) },
						},
					},
				],
			},
		}),
	);
};
