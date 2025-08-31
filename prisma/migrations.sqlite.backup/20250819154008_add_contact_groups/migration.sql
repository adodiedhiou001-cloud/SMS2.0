/*
  Warnings:

  - You are about to drop the column `name` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `contacts` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `contacts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "contact_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#3B82F6',
    "icon" TEXT DEFAULT 'Users',
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contact_groups_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "company" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "organizationId" TEXT NOT NULL,
    "groupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contacts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "contacts_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "contact_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_contacts" ("createdAt", "email", "id", "organizationId", "updatedAt") SELECT "createdAt", "email", "id", "organizationId", "updatedAt" FROM "contacts";
DROP TABLE "contacts";
ALTER TABLE "new_contacts" RENAME TO "contacts";
CREATE INDEX "contacts_phone_idx" ON "contacts"("phone");
CREATE INDEX "contacts_groupId_idx" ON "contacts"("groupId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
