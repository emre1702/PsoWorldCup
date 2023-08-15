import { z } from 'zod';
import { protectedInputProcedure, protectedProcedure, router } from '../trpc';

const detailProcedure = protectedInputProcedure(z.number())
  .output(
    z
      .object({
        id: z.number(),
        name: z.string(),
        logo: z.string().nullable(),
        captain: z.object({ id: z.number(), name: z.string() }).nullable(),
        players: z.array(z.object({ id: z.number(), name: z.string() })),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
      .nullable()
  )
  .query(({ input: { input }, ctx }) =>
    ctx.prisma.team
      .findUnique({
        where: { id: input },
        select: {
          id: true,
          name: true,
          logo: true,
          captain: { select: { id: true, name: true } },
          players: { select: { id: true, name: true } },
          createdAt: true,
          updatedAt: true,
        },
      })
      .then((e) =>
        e
          ? {
              ...e,
              captain: e.captain
                ? { id: e.captain?.id, name: e.captain?.name }
                : e.captain,
              players: e.players?.map((e) => ({ id: e.id, name: e.name })),
            }
          : e
      )
  );

const listProcedure = protectedProcedure
  .output(
    z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        captain: z.string().optional(),
        logo: z.string().nullable(),
      })
    )
  )
  .query(({ ctx }) =>
    ctx.prisma.team
      .findMany({
        select: {
          id: true,
          name: true,
          logo: true,
          captain: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
      })
      .then((e) => e.map((e) => ({ ...e, captain: e.captain?.name })))
  );

const createProcedure = protectedInputProcedure(
  z.object({
    name: z.string(),
    captainId: z.number(),
    playerIds: z.array(z.number()),
    logo: z.string().nullable(),
  })
)
  .output(z.number())
  .mutation(
    async ({ input: { input }, ctx }) =>
      await ctx.prisma.team
        .create({
          data: {
            name: input.name,
            captainId: input.captainId,
            players: { connect: input.playerIds.map((e) => ({ id: e })) },
            logo: input.logo,
          },
          select: { id: true },
        })
        .then((e) => e.id)
  );

const updateProcedure = protectedInputProcedure(
  z.object({
    id: z.number(),
    name: z.string(),
    captainId: z.number().nullable(),
    playerIds: z.array(z.number()),
    logo: z.string().optional(),
  })
).mutation(
  async ({ input: { input }, ctx }) =>
    await ctx.prisma.team.update({
      where: { id: input.id },
      data: {
        name: input.name,
        captainId: input.captainId,
        logo: input.logo,
        players: { set: input.playerIds.map((e) => ({ id: e })) },
      },
    })
);

const deleteProcedure = protectedInputProcedure(z.number()).mutation(
  async ({ input: { input }, ctx }) => {
    await ctx.prisma.team.delete({ where: { id: input } });
  }
);

export const teamsRouter = router({
  detail: detailProcedure,
  list: listProcedure,
  create: createProcedure,
  update: updateProcedure,
  delete: deleteProcedure,
});
