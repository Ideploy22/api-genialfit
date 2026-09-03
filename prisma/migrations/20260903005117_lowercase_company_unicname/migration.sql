-- unicName agora é sempre salvo/consultado em minúsculo (ver CreateCompanyDto
-- e CompanyService.findByUnicName) — o totem sempre forçava UPPERCASE na
-- busca pública (GET /company/public/:unicName), então uma empresa cadastrada
-- em outra caixa nunca era encontrada. Normaliza as linhas existentes pra não
-- quebrar totens já vinculados a essas empresas.
UPDATE "Company" SET "unicName" = LOWER("unicName");
