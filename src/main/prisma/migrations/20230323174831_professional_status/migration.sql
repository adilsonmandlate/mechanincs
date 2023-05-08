-- CreateEnum
CREATE TYPE "JobState" AS ENUM ('Busy', 'Free', 'Pending');

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "state" "JobState";
