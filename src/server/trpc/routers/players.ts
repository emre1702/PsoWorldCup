import { z } from 'zod';
import { router } from '../trpc';
import { protectedProcedure, protectedInputProcedure } from '../helpers/discord-oauth2.helpers';

const detailProcedure = protectedInputProcedure(z.number())
  .output(
    z
      .object({
        id: z.number(),
        name: z.string(),
        teamId: z.number().nullable(),
        isCaptain: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
      .nullable()
  )
  .query(({ input: { input }, ctx }) =>
    ctx.prisma.player
      .findUnique({
        where: { id: input },
        select: {
          id: true,
          name: true,
          teamId: true,
          captainOf: { select: { id: true } },
          createdAt: true,
          updatedAt: true,
        },
      })
      .then((e) => (e ? { ...e, isCaptain: !!e.captainOf } : e))
  );

const listWithoutTeamProcedure = protectedProcedure
  .output(
    z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
  )
  .query(({ ctx }) =>
    ctx.prisma.player.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
      where: { teamId: null },
    })
  );

const listAllProcedure = protectedProcedure
  .output(
    z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        team: z.object({ id: z.number(), name: z.string() }).nullable(),
        isCaptain: z.boolean(),
      })
    )
  )
  .query(({ ctx }) =>
    ctx.prisma.player
      .findMany({
        select: {
          id: true,
          name: true,
          team: { select: { id: true, name: true } },
          captainOf: { select: { id: true } },
        },
      })
      .then((e) => e.map((e) => ({ ...e, isCaptain: !!e.captainOf })))
  );

const listByTeamProcedure = protectedInputProcedure(z.number())
  .output(
    z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
  )
  .query(({ ctx, input: { input } }) =>
    ctx.prisma.player.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
      where: { teamId: input },
    })
  );

const createProcedure = protectedInputProcedure(
    z.object({
      name: z.string(),
      teamId: z.number().nullable(),
    })
  )
  .output(z.number())
  .mutation(
    async ({ input: { input }, ctx }) =>
      await ctx.prisma.player
        .create({
          data: { name: input.name, teamId: input.teamId },
          select: { id: true },
        })
        .then((e) => e.id)
  );

const updateProcedure = protectedInputProcedure(
    z.object({
      id: z.number(),
      name: z.string(),
      teamId: z.number().nullable(),
    })
  )
  .mutation(
    async ({ input: { input }, ctx }) =>
      await ctx.prisma.player.update({
        where: { id: input.id },
        data: { name: input.name, teamId: input.teamId },
      })
  );

const deleteProcedure = protectedInputProcedure(z.number())
  .mutation(async ({ input: { input }, ctx }) => {
    await ctx.prisma.player.delete({ where: { id: input } });
  });

export const playersRouter = router({
  detail: detailProcedure,
  listWithoutTeam: listWithoutTeamProcedure,
  listAll: listAllProcedure,
  listByTeam: listByTeamProcedure,
  create: createProcedure,
  update: updateProcedure,
  delete: deleteProcedure,
});
