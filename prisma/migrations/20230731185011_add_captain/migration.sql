/*
  Warnings:

  - You are about to drop the column `score1` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `score2` on the `match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[captainId]` on the table `team` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "player" DROP CONSTRAINT "player_teamId_fkey";

-- AlterTable
ALTER TABLE "match" DROP COLUMN "score1",
DROP COLUMN "score2";

-- AlterTable
ALTER TABLE "player" ALTER COLUMN "teamId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "team" ADD COLUMN     "captainId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "team_captainId_key" ON "team"("captainId");

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
