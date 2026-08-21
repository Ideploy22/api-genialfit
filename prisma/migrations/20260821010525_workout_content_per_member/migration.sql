/*
  Warnings:

  - You are about to drop the column `companyId` on the `WorkoutContent` table. All the data in the column will be lost.
  - Added the required column `memberId` to the `WorkoutContent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkoutContent" DROP CONSTRAINT "WorkoutContent_companyId_fkey";

-- DropIndex
DROP INDEX "WorkoutContent_companyId_order_idx";

-- AlterTable
ALTER TABLE "WorkoutContent" DROP COLUMN "companyId",
ADD COLUMN     "memberId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "WorkoutContent_memberId_order_idx" ON "WorkoutContent"("memberId", "order");

-- AddForeignKey
ALTER TABLE "WorkoutContent" ADD CONSTRAINT "WorkoutContent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
