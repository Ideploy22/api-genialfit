-- CreateTable
CREATE TABLE "CompanyBanner" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyBanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyBanner_companyId_order_idx" ON "CompanyBanner"("companyId", "order");

-- AddForeignKey
ALTER TABLE "CompanyBanner" ADD CONSTRAINT "CompanyBanner_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
