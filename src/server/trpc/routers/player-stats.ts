import ArrayHelpers from '../../../helpers/array.helpers';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';

const playerStatsOutput = z.array(
  z.object({
    player: z.object({ id: z.number(), name: z.string() }),
    score: z.number(),
    interceptions: z.number(),
    goals: z.number(),
    assists: z.number(),
    passes: z.number(),
    shots: z.number(),
    tackles: z.number(),
    saves: z.number(),
    teamId: z.number(),
    catches: z.number(),
    amountPlayed: z.number(),
  })
);

const listSumProcedure = publicProcedure
  .output(playerStatsOutput)
  .query(({ ctx }) =>
    ctx.prisma.statistic
      .findMany({
        select: {
          player: { select: { id: true, name: true } },
          score: true,
          interceptions: true,
          goals: true,
          assists: true,
          passes: true,
          shots: true,
          tackles: true,
          saves: true,
          teamId: true,
          catches: true,
        },
        orderBy: { player: { id: 'asc' } },
      })
      .then((e) =>
        Object.values(ArrayHelpers.groupBy(e, (entry) => entry.player.id)).map(
          (values) => ({
            player: values[0].player,
            teamId: values[0].teamId,
            score: values.reduce((prev, curr) => prev + curr.score, 0),
            interceptions: values.reduce(
              (prev, curr) => prev + curr.interceptions,
              0
            ),
            goals: values.reduce((prev, curr) => prev + curr.goals, 0),
            assists: values.reduce((prev, curr) => prev + curr.assists, 0),
            passes: values.reduce((prev, curr) => prev + curr.passes, 0),
            shots: values.reduce((prev, curr) => prev + curr.shots, 0),
            tackles: values.reduce((prev, curr) => prev + curr.tackles, 0),
            saves: values.reduce((prev, curr) => prev + curr.saves, 0),
            catches: values.reduce((prev, curr) => prev + curr.catches, 0),
            amountPlayed: values.length,
          })
        )
      )
  );

const listAverageProcedure = publicProcedure
  .output(playerStatsOutput)
  .query(({ ctx }) =>
    ctx.prisma.statistic
      .findMany({
        select: {
          player: { select: { id: true, name: true } },
          teamId: true,
          score: true,
          interceptions: true,
          goals: true,
          assists: true,
          passes: true,
          shots: true,
          tackles: true,
          saves: true,
          catches: true,
        },
        orderBy: { player: { id: 'asc' } },
      })
      .then((e) =>
        Object.values(ArrayHelpers.groupBy(e, (entry) => entry.player.id)).map(
          // Average everything
          (values) => ({
            player: values[0].player,
            teamId: values[0].teamId,
            score:
              values.reduce((prev, curr) => prev + curr.score, 0) /
              values.length,
            interceptions:
              values.reduce((prev, curr) => prev + curr.interceptions, 0) /
              values.length,
            goals:
              values.reduce((prev, curr) => prev + curr.goals, 0) /
              values.length,
            assists:
              values.reduce((prev, curr) => prev + curr.assists, 0) /
              values.length,
            passes:
              values.reduce((prev, curr) => prev + curr.passes, 0) /
              values.length,
            shots:
              values.reduce((prev, curr) => prev + curr.shots, 0) /
              values.length,
            tackles:
              values.reduce((prev, curr) => prev + curr.tackles, 0) /
              values.length,
            saves:
              values.reduce((prev, curr) => prev + curr.saves, 0) /
              values.length,
            catches:
              values.reduce((prev, curr) => prev + curr.catches, 0) /
              values.length,
            amountPlayed: values.length,
          })
        )
      )
  );

export const playerStatsRouter = router({
  listSum: listSumProcedure,
  listAverage: listAverageProcedure,
});
