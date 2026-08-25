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

# Prisma
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    pnpm prisma generate

# NestJS / TypeScript
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Código
COPY src ./src/

# Build
RUN pnpm build

# Corrige aliases do TypeScript
RUN pnpm exec tsc-alias -p tsconfig.build.json


# =============================================================
# Stage 3: Production
# =============================================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9 --activate

# =============================================================
# Production dependencies
# =============================================================

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod


# =============================================================
# Prisma
# =============================================================

COPY prisma ./prisma/
COPY prisma.config.ts ./

# Prisma Client gerado no builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# =============================================================
# Application
# =============================================================

COPY --from=builder /app/dist ./dist


# =============================================================
# Network
# =============================================================

EXPOSE 5000


# =============================================================
# Start
# =============================================================

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main.js"]