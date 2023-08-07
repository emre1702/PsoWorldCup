/*
  Warnings:

  - Added the required column `teamId` to the `statistic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_team1Id_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_team2Id_fkey";

-- DropForeignKey
ALTER TABLE "permission" DROP CONSTRAINT "permission_userId_fkey";

-- DropForeignKey
ALTER TABLE "statistic" DROP CONSTRAINT "statistic_matchId_fkey";

-- DropForeignKey
ALTER TABLE "statistic" DROP CONSTRAINT "statistic_playerId_fkey";

-- AlterTable
ALTER TABLE "statistic" ADD COLUMN     "teamId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
