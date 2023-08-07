/*
  Warnings:

  - You are about to drop the column `score` on the `statistic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "match" ADD COLUMN     "scoreTeam1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scoreTeam2" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "statistic" DROP COLUMN "score";
