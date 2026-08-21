-- DropIndex
DROP INDEX "WorkoutContent_companyId_memberId_order_idx";

-- AlterTable
ALTER TABLE "WorkoutContent" ADD COLUMN     "label" TEXT;

-- CreateIndex
CREATE INDEX "WorkoutContent_companyId_memberId_label_order_idx" ON "WorkoutContent"("companyId", "memberId", "label", "order");
