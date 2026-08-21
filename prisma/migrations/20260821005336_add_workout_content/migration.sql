-- CreateTable
CREATE TABLE "WorkoutContent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT,
    "series" TEXT,
    "reps" TEXT,
    "load" TEXT,
    "annotation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 10,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutContent_companyId_order_idx" ON "WorkoutContent"("companyId", "order");

-- AddForeignKey
ALTER TABLE "WorkoutContent" ADD CONSTRAINT "WorkoutContent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
