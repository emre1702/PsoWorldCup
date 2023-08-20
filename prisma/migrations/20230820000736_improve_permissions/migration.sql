/*
  Warnings:

  - You are about to drop the column `superadmin` on the `user` table. All the data in the column will be lost.
  - Changed the type of `type` on the `log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'SEE_TEAMS';
ALTER TYPE "Permission" ADD VALUE 'SEE_PLAYERS';
ALTER TYPE "Permission" ADD VALUE 'SEE_MATCHES';
ALTER TYPE "Permission" ADD VALUE 'SEE_USERS';
ALTER TYPE "Permission" ADD VALUE 'CREATE_USER';
ALTER TYPE "Permission" ADD VALUE 'UPDATE_USER';
ALTER TYPE "Permission" ADD VALUE 'DELETE_USER';

-- AlterTable
TRUNCATE "log";
ALTER TABLE "log" DROP COLUMN "type",
ADD COLUMN     "type" "LogType" NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "superadmin";
