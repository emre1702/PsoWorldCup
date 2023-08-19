-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('MUTATION');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "superadmin" BOOLEAN NOT NULL DEFAULT false;
