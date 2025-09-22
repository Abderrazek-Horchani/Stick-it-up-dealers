-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RestockRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dealerName" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);
INSERT INTO "new_RestockRequest" ("dealerName", "id", "timestamp") SELECT "dealerName", "id", "timestamp" FROM "RestockRequest";
DROP TABLE "RestockRequest";
ALTER TABLE "new_RestockRequest" RENAME TO "RestockRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
