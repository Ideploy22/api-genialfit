-- CreateTable
CREATE TABLE "DueDayOption" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DueDayOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DueDayOption_companyId_day_key" ON "DueDayOption"("companyId", "day");

-- AddForeignKey
ALTER TABLE "DueDayOption" ADD CONSTRAINT "DueDayOption_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
