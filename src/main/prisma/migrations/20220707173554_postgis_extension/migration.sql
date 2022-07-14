/*
 Warnings:

 - The `profession` column on the `Professional` table would be dropped and recreated. This will lead to data loss if there is data in the column.
 - The `education` column on the `Professional` table would be dropped and recreated. This will lead to data loss if there is data in the column.

 */
-- Install PostGis extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "Profession" AS ENUM ('Mechanic');

-- CreateEnum
CREATE TYPE "Education" AS ENUM (
  'Primary',
  'Secondary',
  'University',
  'Master',
  'PhD'
);

-- AlterTable
ALTER TABLE
  "Professional" DROP COLUMN "profession",
ADD
  COLUMN "profession" "Profession",
  DROP COLUMN "education",
ADD
  COLUMN "education" "Education";
