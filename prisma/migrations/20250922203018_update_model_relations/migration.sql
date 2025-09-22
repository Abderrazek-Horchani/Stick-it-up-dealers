/*
  Warnings:

  - You are about to drop the `Dealer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeeklyPerformance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Dealer";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SalesRecord";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WeeklyPerformance";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "dealers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "commission" REAL NOT NULL DEFAULT 0.20,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sales_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dealerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "commission" REAL NOT NULL,
    "earnings" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "week" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "sales_records_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weekly_performance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dealerId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalSales" REAL NOT NULL,
    "totalEarnings" REAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "weekly_performance_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "sales_records_dealerId_idx" ON "sales_records"("dealerId");

-- CreateIndex
CREATE INDEX "sales_records_week_year_idx" ON "sales_records"("week", "year");

-- CreateIndex
CREATE INDEX "weekly_performance_week_year_idx" ON "weekly_performance"("week", "year");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_performance_dealerId_week_year_key" ON "weekly_performance"("dealerId", "week", "year");
