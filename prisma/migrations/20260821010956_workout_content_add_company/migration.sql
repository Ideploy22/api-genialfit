/*
  Warnings:

  - Added the required column `companyId` to the `WorkoutContent` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "WorkoutContent_memberId_order_idx";

-- AlterTable
ALTER TABLE "WorkoutContent" ADD COLUMN     "companyId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "WorkoutContent_companyId_memberId_order_idx" ON "WorkoutContent"("companyId", "memberId", "order");

-- AddForeignKey
ALTER TABLE "WorkoutContent" ADD CONSTRAINT "WorkoutContent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
