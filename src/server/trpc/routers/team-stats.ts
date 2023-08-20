import ArrayHelpers from '../../../helpers/array.helpers';
import { protectedProcedure, router } from '../trpc';
import { z } from 'zod';

const teamStatsOutput = z.array(
  z.object({
    team: z.object({
      id: z.number(),
      name: z.string(),
      logo: z.string().nullable(),
    }),
    wins: z.number(),
    losses: z.number(),
    scored: z.number(),
    conceded: z.number(),
    interceptions: z.number(),
    goals: z.number(),
    assists: z.number(),
    passes: z.number(),
    shots: z.number(),
    tackles: z.number(),
    saves: z.number(),
    catches: z.number(),
    amountPlayed: z.number(),
  })
);

const listSumProcedure = protectedProcedure()
  .output(teamStatsOutput)
  .query(({ ctx }) =>
    ctx.prisma.team
      .findMany({
        select: {
          id: true,
          name: true,
          logo: true,
          matches1: {
            select: {
              scoreTeam1: true,
              scoreTeam2: true,
            },
          },
          matches2: {
            select: {
              scoreTeam1: true,
              scoreTeam2: true,
            },
          },
          statistics: {
            select: {
              interceptions: true,
              goals: true,
              assists: true,
              passes: true,
              shots: true,
              tackles: true,
              saves: true,
              catches: true,
            },
          },
        },
      })
      .then((teams) =>
        teams.map((team) => ({
          team: {
            id: team.id,
            name: team.name,
            logo: team.logo,
          },
          wins:
            team.matches1.filter((match) => match.scoreTeam1 > match.scoreTeam2)
              .length +
            team.matches2.filter((match) => match.scoreTeam2 > match.scoreTeam1)
              .length,
          losses:
            team.matches1.filter((match) => match.scoreTeam1 < match.scoreTeam2)
              .length +
            team.matches2.filter((match) => match.scoreTeam2 < match.scoreTeam1)
              .length,
          scored:
            team.matches1.reduce((prev, curr) => prev + curr.scoreTeam1, 0) +
            team.matches2.reduce((prev, curr) => prev + curr.scoreTeam2, 0),
          conceded:
            team.matches1.reduce((prev, curr) => prev + curr.scoreTeam2, 0) +
            team.matches2.reduce((prev, curr) => prev + curr.scoreTeam1, 0),
          interceptions: team.statistics.reduce(
            (prev, curr) => prev + curr.interceptions,
            0
          ),
          goals: team.statistics.reduce((prev, curr) => prev + curr.goals, 0),
          assists: team.statistics.reduce(
            (prev, curr) => prev + curr.assists,
            0
          ),
          passes: team.statistics.reduce((prev, curr) => prev + curr.passes, 0),
          shots: team.statistics.reduce((prev, curr) => prev + curr.shots, 0),
          tackles: team.statistics.reduce(
            (prev, curr) => prev + curr.tackles,
            0
          ),
          saves: team.statistics.reduce((prev, curr) => prev + curr.saves, 0),
          catches: team.statistics.reduce(
            (prev, curr) => prev + curr.catches,
            0
          ),
          amountPlayed: team.matches1.length + team.matches2.length,
        }))
      )
  );

const listAverageProcedure = protectedProcedure()
  .output(teamStatsOutput)
  .query(({ ctx }) =>
    ctx.prisma.team
      .findMany({
        select: {
          id: true,
          name: true,
          logo: true,
          matches1: {
            select: {
              scoreTeam1: true,
              scoreTeam2: true,
            },
          },
          matches2: {
            select: {
              scoreTeam1: true,
              scoreTeam2: true,
            },
          },
          statistics: {
            select: {
              interceptions: true,
              goals: true,
              assists: true,
              passes: true,
              shots: true,
              tackles: true,
              saves: true,
              catches: true,
            },
          },
        },
      })
      .then((teams) =>
        teams.map((team) => ({
          team: {
            id: team.id,
            name: team.name,
            logo: team.logo,
          },
          wins:
            (team.matches1.filter(
              (match) => match.scoreTeam1 > match.scoreTeam2
            ).length +
              team.matches2.filter(
                (match) => match.scoreTeam2 > match.scoreTeam1
              ).length) /
            (team.matches1.length + team.matches2.length),
          losses:
            (team.matches1.filter(
              (match) => match.scoreTeam1 < match.scoreTeam2
            ).length +
              team.matches2.filter(
                (match) => match.scoreTeam2 < match.scoreTeam1
              ).length) /
            (team.matches1.length + team.matches2.length),
          scored:
            (team.matches1.reduce((prev, curr) => prev + curr.scoreTeam1, 0) +
              team.matches2.reduce((prev, curr) => prev + curr.scoreTeam2, 0)) /
            (team.matches1.length + team.matches2.length),
          conceded:
            (team.matches1.reduce((prev, curr) => prev + curr.scoreTeam2, 0) +
              team.matches2.reduce((prev, curr) => prev + curr.scoreTeam1, 0)) /
            (team.matches1.length + team.matches2.length),
          interceptions:
            team.statistics.reduce(
              (prev, curr) => prev + curr.interceptions,
              0
            ) / team.statistics.length,
          goals:
            team.statistics.reduce((prev, curr) => prev + curr.goals, 0) /
            team.statistics.length,
          assists:
            team.statistics.reduce((prev, curr) => prev + curr.assists, 0) /
            team.statistics.length,
          passes:
            team.statistics.reduce((prev, curr) => prev + curr.passes, 0) /
            team.statistics.length,
          shots:
            team.statistics.reduce((prev, curr) => prev + curr.shots, 0) /
            team.statistics.length,
          tackles:
            team.statistics.reduce((prev, curr) => prev + curr.tackles, 0) /
            team.statistics.length,
          saves:
            team.statistics.reduce((prev, curr) => prev + curr.saves, 0) /
            team.statistics.length,
          catches:
            team.statistics.reduce((prev, curr) => prev + curr.catches, 0) /
            team.statistics.length,
          amountPlayed: team.matches1.length + team.matches2.length,
        }))
      )
  );

export const teamStatsRouter = router({
  listSum: listSumProcedure,
  listAverage: listAverageProcedure,
});
