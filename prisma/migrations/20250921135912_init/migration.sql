-- CreateTable
CREATE TABLE "RestockRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dealerName" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StickerRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "requestId" INTEGER NOT NULL,
    CONSTRAINT "StickerRequest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RestockRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
