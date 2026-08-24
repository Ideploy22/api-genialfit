# =============================================================
# Stage 1: Builder
# =============================================================
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma/
COPY prisma.config.ts ./
# DATABASE_URL não é usada para conexão aqui — só para o prisma.config.ts não lançar erro de validação
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" pnpm prisma generate

# nest-cli.json NÃO tem webpack — usa tsc puro
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/

# 1) nest build  → compila TypeScript para dist/
# 2) tsc-alias   → reescreve @/ e src/ para paths relativos reais
RUN pnpm build && npx --yes tsc-alias@latest -p tsconfig.build.json


# =============================================================
# Stage 2: Production
# =============================================================
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Schema + config necessários para o prisma migrate deploy no entrypoint
COPY prisma ./prisma/
COPY prisma.config.ts ./

# dist/ já com todos os paths reescritos pelo tsc-alias
COPY --from=builder /app/dist ./dist

COPY public ./public/

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
