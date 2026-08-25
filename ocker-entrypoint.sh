#!/bin/sh

set -e

echo "========================================"
echo " Iniciando API NestJS"
echo "========================================"

echo "Executando migrations do Prisma..."

pnpm prisma migrate deploy

echo "Migrations concluídas."

echo "Iniciando aplicação..."

exec node dist/main.js