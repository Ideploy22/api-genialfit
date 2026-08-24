-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('PIX', 'DEBIT_CARD', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "PaymentIntegrationType" AS ENUM ('MANUAL', 'PINPAD');

-- CreateTable
CREATE TABLE "PaymentMethodConfig" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "integrationType" "PaymentIntegrationType" NOT NULL DEFAULT 'MANUAL',
    "provider" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethodConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethodConfig_companyId_type_key" ON "PaymentMethodConfig"("companyId", "type");

-- AddForeignKey
ALTER TABLE "PaymentMethodConfig" ADD CONSTRAINT "PaymentMethodConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
