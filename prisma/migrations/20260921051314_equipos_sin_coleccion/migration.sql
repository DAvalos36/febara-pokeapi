/*
  Warnings:

  - You are about to drop the `Capture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `captureId` on the `TeamMember` table. All the data in the column will be lost.
  - Added the required column `name` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pokemonId` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Capture_userId_pokemonId_key";

-- DropIndex
DROP INDEX "Capture_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Capture";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slot" INTEGER NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "notes" TEXT,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TeamMember" ("id", "slot", "teamId") SELECT "id", "slot", "teamId" FROM "TeamMember";
DROP TABLE "TeamMember";
ALTER TABLE "new_TeamMember" RENAME TO "TeamMember";
CREATE UNIQUE INDEX "TeamMember_teamId_slot_key" ON "TeamMember"("teamId", "slot");
CREATE UNIQUE INDEX "TeamMember_teamId_pokemonId_key" ON "TeamMember"("teamId", "pokemonId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
