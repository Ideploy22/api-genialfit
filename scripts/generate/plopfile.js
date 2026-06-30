module.exports = function (plop) {
  plop.setGenerator("module", {
    description: "Gera um módulo NestJS seguindo o padrão do projeto",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Nome do módulo (kebab-case plural, ex: files-processos):",
      },
      {
        type: "input",
        name: "singular",
        message: "Nome singular (kebab-case, ex: files-processo):",
      },
      {
        type: "input",
        name: "prismaModel",
        message: "Nome do model Prisma (camelCase, ex: filesProcedures):",
      },
    ],
    actions: [
      {
        type: "add",
        path: "../../src/modules/{{name}}/dto/create-{{singular}}.dto.ts",
        templateFile: "templates/create-dto.hbs",
      },
      {
        type: "add",
        path: "../../src/modules/{{name}}/dto/update-{{singular}}.dto.ts",
        templateFile: "templates/update-dto.hbs",
      },
      {
        type: "add",
        path: "../../src/modules/{{name}}/entities/{{singular}}.entity.ts",
        templateFile: "templates/entity.hbs",
      },
      {
        type: "add",
        path: "../../src/modules/{{name}}/{{name}}.controller.spec.ts",
        templateFile: "templates/controller.spec.hbs",
      },
      {
        type: "add",
        path: "../../src/modules/{{name}}/{{name}}.controller.ts",
        templateFile: "templates/controller.hbs",
      },
      {
        type: "add",
        path: "../../src/modules/{{name}}/{{name}}.module.ts",
        templateFile: "templates/module.hbs",
      },
      {
        type: "add",
        path: "../../src/modules/{{name}}/{{name}}.service.spec.ts",
        templateFile: "templates/service.spec.hbs",
      },
      {
        type: "add",
        path: "../../src/modules/{{name}}/{{name}}.service.ts",
        templateFile: "templates/service.hbs",
      },
    ],
  });
};
