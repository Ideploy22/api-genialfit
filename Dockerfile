# =============================================================
# Stage 1: Dependencies
# =============================================================
FROM node:22-alpine AS dependencies

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


# =============================================================
# Stage 2: Builder
# =============================================================
FROM dependencies AS builder

WORKDIR /app

# Arquivos necessários para gerar o Prisma Client
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Gera o Prisma Client
# DATABASE_URL é apenas uma variável dummy para validação do config
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    pnpm prisma generate

# Configurações do NestJS/TypeScript
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Código-fonte
COPY src ./src/

# Build da aplicação
RUN pnpm build

# Corrige aliases como @/xxx para caminhos relativos
RUN pnpm exec tsc-alias -p tsconfig.build.json


# =============================================================
# Stage 3: Production
# =============================================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9 --activate

# =============================================================
# Dependências de produção
# =============================================================

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod


# =============================================================
# Prisma
# =============================================================

COPY prisma ./prisma/
COPY prisma.config.ts ./

# =============================================================
# Aplicação compilada
# =============================================================

COPY --from=builder /app/dist ./dist

# =============================================================
# EntryPoint
# =============================================================

COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

# =============================================================
# Configuração da aplicação
# =============================================================

EXPOSE 4444

ENTRYPOINT ["./docker-entrypoint.sh"]