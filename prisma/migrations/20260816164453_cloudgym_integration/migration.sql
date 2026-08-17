-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'FROZEN', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "AggregatorProvider" AS ENUM ('GYMPASS', 'TOTALPASS', 'WELLHUB');

-- CreateEnum
CREATE TYPE "MemberEvent" AS ENUM ('REGISTERED_TOTEM', 'SYNCED_WEBHOOK', 'LOGIN_CPF_SUCCESS', 'LOGIN_CPF_FAILED', 'LOGIN_QR_SUCCESS', 'LOGIN_QR_FAILED', 'LOGIN_AGGREGATOR_SUCCESS', 'LOGIN_AGGREGATOR_FAILED', 'WORKOUT_COMPLETED', 'INVOICE_PAID');

-- CreateTable
CREATE TABLE "CloudgymIntegration" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,
    "baseUrl" TEXT,
    "username" TEXT NOT NULL,
    "passwordEncrypted" TEXT NOT NULL,
    "webhookSecret" TEXT NOT NULL,
    "accessToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudgymIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cloudgymMemberId" INTEGER,
    "cpf" TEXT,
    "matricula" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "avatar" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'PROSPECT',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberLog" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "deviceId" TEXT,
    "event" "MemberEvent" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "cloudgymContractId" INTEGER,
    "cloudgymPlanId" INTEGER,
    "planName" TEXT,
    "price" DECIMAL(65,30),
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "dueDay" INTEGER,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "contractId" TEXT,
    "cloudgymInvoiceId" INTEGER,
    "amount" DECIMAL(65,30) NOT NULL,
    "discount" DECIMAL(65,30) DEFAULT 0,
    "punctualityDiscount" DECIMAL(65,30) DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "methodPayment" TEXT,
    "paidAt" TIMESTAMP(3),
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanContent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cloudgymPlanId" INTEGER NOT NULL,
    "description" TEXT,
    "services" JSONB,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutCompletion" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "exerciseRef" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aggregator" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provider" "AggregatorProvider" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aggregator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberAggregatorLink" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "provider" "AggregatorProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberAggregatorLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudgymWebhookEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "eventType" TEXT,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CloudgymWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CloudgymIntegration_companyId_key" ON "CloudgymIntegration"("companyId");

-- CreateIndex
CREATE INDEX "Member_companyId_status_idx" ON "Member"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Member_companyId_cpf_key" ON "Member"("companyId", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Member_companyId_matricula_key" ON "Member"("companyId", "matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Member_companyId_cloudgymMemberId_key" ON "Member"("companyId", "cloudgymMemberId");

-- CreateIndex
CREATE INDEX "MemberLog_memberId_createdAt_idx" ON "MemberLog"("memberId", "createdAt");

-- CreateIndex
CREATE INDEX "MemberLog_event_idx" ON "MemberLog"("event");

-- CreateIndex
CREATE INDEX "Contract_memberId_status_idx" ON "Contract"("memberId", "status");

-- CreateIndex
CREATE INDEX "Invoice_memberId_status_idx" ON "Invoice"("memberId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_memberId_cloudgymInvoiceId_key" ON "Invoice"("memberId", "cloudgymInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanContent_companyId_cloudgymPlanId_key" ON "PlanContent"("companyId", "cloudgymPlanId");

-- CreateIndex
CREATE INDEX "WorkoutCompletion_memberId_completedAt_idx" ON "WorkoutCompletion"("memberId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutCompletion_memberId_exerciseRef_completedAt_key" ON "WorkoutCompletion"("memberId", "exerciseRef", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Aggregator_companyId_provider_key" ON "Aggregator"("companyId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "MemberAggregatorLink_provider_externalId_key" ON "MemberAggregatorLink"("provider", "externalId");

-- CreateIndex
CREATE INDEX "CloudgymWebhookEvent_companyId_receivedAt_idx" ON "CloudgymWebhookEvent"("companyId", "receivedAt");

-- CreateIndex
CREATE INDEX "CloudgymWebhookEvent_processed_idx" ON "CloudgymWebhookEvent"("processed");

-- AddForeignKey
ALTER TABLE "CloudgymIntegration" ADD CONSTRAINT "CloudgymIntegration_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberLog" ADD CONSTRAINT "MemberLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanContent" ADD CONSTRAINT "PlanContent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutCompletion" ADD CONSTRAINT "WorkoutCompletion_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aggregator" ADD CONSTRAINT "Aggregator_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAggregatorLink" ADD CONSTRAINT "MemberAggregatorLink_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
