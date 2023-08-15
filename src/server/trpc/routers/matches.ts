import { z } from 'zod';
import { protectedInputProcedure, protectedProcedure, router } from '../trpc';

const detailProcedure = protectedInputProcedure(z.number())
  .output(
    z
      .object({
        id: z.number(),
        date: z.date(),
        team1: z.object({ id: z.number(), name: z.string() }),
        team2: z.object({ id: z.number(), name: z.string() }),
        scoreTeam1: z.number(),
        scoreTeam2: z.number(),
      })
      .nullable()
  )
  .query(({ input, ctx }) =>
    ctx.prisma.match.findUnique({
      where: { id: input.input },
      select: {
        id: true,
        date: true,
        team1: { select: { id: true, name: true } },
        team2: { select: { id: true, name: true } },
        scoreTeam1: true,
        scoreTeam2: true,
        statistics: { include: { player: { select: { name: true } } } },
      },
    })
  );

const listProcedure = protectedProcedure
  .output(
    z.array(
      z.object({
        id: z.number(),
        date: z.date(),
        team1: z.string(),
        team2: z.string(),
        scoreTeam1: z.number(),
        scoreTeam2: z.number(),
      })
    )
  )
  .query(({ ctx }) =>
    ctx.prisma.match
      .findMany({
        select: {
          id: true,
          date: true,
          team1: { select: { name: true } },
          team2: { select: { name: true } },
          scoreTeam1: true,
          scoreTeam2: true,
        },
        orderBy: { id: 'desc' },
      })
      .then((entry) =>
        entry.map((e) => ({
          ...e,
          team1: e.team1?.name,
          team2: e.team2?.name,
        }))
      )
  );

const createProcedure = protectedInputProcedure(
  z.object({
    date: z.date(),
    round: z.number(),
    team1Id: z.number(),
    team2Id: z.number(),
    team1Score: z.number(),
    team2Score: z.number(),
    statistics: z.array(
      z.object({
        playerId: z.number(),
        teamId: z.number(),
        score: z.number(),
        goals: z.number(),
        assists: z.number(),
        catches: z.number(),
        interceptions: z.number(),
        tackles: z.number(),
        passes: z.number(),
        saves: z.number(),
        shots: z.number(),
      })
    ),
  })
)
  .output(z.number())
  .mutation(
    async ({ input: { input }, ctx }) =>
      await ctx.prisma.match
        .create({
          data: {
            team1: { connect: { id: input.team1Id } },
            team2: { connect: { id: input.team2Id } },
            round: input.round,
            date: input.date,
            scoreTeam1: input.team1Score,
            scoreTeam2: input.team2Score,
            statistics: {
              create: input.statistics.map((e) => ({
                player: { connect: { id: e.playerId } },
                score: e.score,
                goals: e.goals,
                assists: e.assists,
                team: { connect: { id: e.teamId } },
                catches: e.catches,
                interceptions: e.interceptions,
                tackles: e.tackles,
                passes: e.passes,
                saves: e.saves,
                shots: e.shots,
              })),
            },
          },
          select: { id: true },
        })
        .then((e) => e.id)
  );

const updateProcedure = protectedInputProcedure(
  z.object({
    id: z.number(),
    date: z.date(),
    team1Id: z.number(),
    team2Id: z.number(),
    team1Score: z.number(),
    team2Score: z.number(),
  })
).mutation(
  async ({ input: { input }, ctx }) =>
    await ctx.prisma.match.update({
      where: { id: input.id },
      data: {
        team1: { connect: { id: input.team1Id } },
        team2: { connect: { id: input.team2Id } },
        date: input.date,
        scoreTeam1: input.team1Score,
        scoreTeam2: input.team2Score,
      },
    })
);

const deleteProcedure = protectedInputProcedure(z.number()).mutation(
  async ({ input: { input }, ctx }) => {
    await ctx.prisma.match.delete({ where: { id: input } });
  }
);

export const matchesRouter = router({
  detail: detailProcedure,
  list: listProcedure,
  create: createProcedure,
  update: updateProcedure,
  delete: deleteProcedure,
});
