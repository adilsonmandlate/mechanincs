-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Professional" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profession" TEXT,
    "education" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Professional" ("createdAt", "education", "email", "experience", "firstname", "id", "lastname", "latitude", "longitude", "password", "phone", "profession") SELECT "createdAt", "education", "email", "experience", "firstname", "id", "lastname", "latitude", "longitude", "password", "phone", "profession" FROM "Professional";
DROP TABLE "Professional";
ALTER TABLE "new_Professional" RENAME TO "Professional";
CREATE UNIQUE INDEX "Professional_email_key" ON "Professional"("email");
CREATE UNIQUE INDEX "Professional_phone_key" ON "Professional"("phone");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
