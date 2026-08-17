/*
  Warnings:

  - Added the required column `name` to the `PlanContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlanContent" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DECIMAL(65,30),
ALTER COLUMN "cloudgymPlanId" DROP NOT NULL;
