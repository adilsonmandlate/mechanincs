/*
  Warnings:

  - You are about to drop the column `name` on the `Professional` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `Professional` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Professional` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstname` to the `Professional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `Professional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Professional" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" BIGINT NOT NULL,
    "password" TEXT NOT NULL,
    "profession" TEXT,
    "education" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Professional" ("createdAt", "education", "email", "experience", "id", "password", "phone", "profession") SELECT "createdAt", "education", "email", "experience", "id", "password", "phone", "profession" FROM "Professional";
DROP TABLE "Professional";
ALTER TABLE "new_Professional" RENAME TO "Professional";
CREATE UNIQUE INDEX "Professional_email_key" ON "Professional"("email");
CREATE UNIQUE INDEX "Professional_phone_key" ON "Professional"("phone");
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo" TEXT,
    "userId" TEXT NOT NULL,
    "professionalId" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("createdAt", "description", "id", "photo", "professionalId", "resolved", "title", "userId") SELECT "createdAt", "description", "id", "photo", "professionalId", "resolved", "title", "userId" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phone" BIGINT NOT NULL,
    "profile_pic" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "password", "phone", "profile_pic") SELECT "createdAt", "email", "id", "password", "phone", "profile_pic" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
