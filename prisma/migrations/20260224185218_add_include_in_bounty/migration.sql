-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publishedAt" DATETIME NOT NULL,
    "title" TEXT,
    "url" TEXT,
    "hadAce" BOOLEAN NOT NULL,
    "winnerName" TEXT,
    "includeInBounty" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Video" ("createdAt", "hadAce", "id", "publishedAt", "title", "url", "winnerName") SELECT "createdAt", "hadAce", "id", "publishedAt", "title", "url", "winnerName" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
