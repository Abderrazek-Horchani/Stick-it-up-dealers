/*
  Warnings:

  - You are about to drop the `RestockRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StickerRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RestockRequest";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StickerRequest";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "restock_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dealerName" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);

-- CreateTable
CREATE TABLE "sticker_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "requestId" INTEGER NOT NULL,
    CONSTRAINT "sticker_requests_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "restock_requests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
