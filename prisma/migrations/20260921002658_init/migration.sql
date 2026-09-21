-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Capture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pokemonId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Capture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Team_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slot" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "captureId" TEXT NOT NULL,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Capture_userId_idx" ON "Capture"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Capture_userId_pokemonId_key" ON "Capture"("userId", "pokemonId");

-- CreateIndex
CREATE INDEX "Team_userId_idx" ON "Team"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_slot_key" ON "TeamMember"("teamId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_captureId_key" ON "TeamMember"("teamId", "captureId");
