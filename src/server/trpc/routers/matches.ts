import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const detailProcedure = publicProcedure
  .input(z.number())
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
      where: { id: input },
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

const listProcedure = publicProcedure
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

const createProcedure = publicProcedure
  .input(
    z.object({
      date: z.date(),
      team1Id: z.number(),
      team2Id: z.number(),
      team1Score: z.number(),
      team2Score: z.number(),
    })
  )
  .output(z.number())
  .mutation(
    async ({ input, ctx }) =>
      await ctx.prisma.match
        .create({
          data: {
            team1: { connect: { id: input.team1Id } },
            team2: { connect: { id: input.team2Id } },
            date: input.date,
            scoreTeam1: input.team1Score,
            scoreTeam2: input.team2Score,
          },
          select: { id: true },
        })
        .then((e) => e.id)
  );

const updateProcedure = publicProcedure
  .input(
    z.object({
      id: z.number(),
      date: z.date(),
      team1Id: z.number(),
      team2Id: z.number(),
      team1Score: z.number(),
      team2Score: z.number(),
    })
  )
  .mutation(
    async ({ input, ctx }) =>
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

const deleteProcedure = publicProcedure
  .input(z.number())
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.match.delete({ where: { id: input } });
  });

export const matchesRouter = router({
  detail: detailProcedure,
  list: listProcedure,
  create: createProcedure,
  update: updateProcedure,
  delete: deleteProcedure,
});
