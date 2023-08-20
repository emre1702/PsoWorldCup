import { z } from 'zod';
import { protectedInputProcedure, protectedProcedure, router } from '../trpc';
import { Permission } from '@prisma/client';

const detailProcedure = protectedInputProcedure(z.number())
  .output(
    z
      .object({
        id: z.number(),
        name: z.string(),
        discordId: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
        permissions: z.array(z.string()),
      })
      .nullable()
  )
  .query(({ input: { input }, ctx }) =>
    ctx.prisma.user
      .findUnique({
        where: { id: input },
        select: {
          id: true,
          name: true,
          discordId: true,
          createdAt: true,
          updatedAt: true,
          permissions: { select: { name: true } },
        },
      })
      .then((e) =>
        e ? { ...e, permissions: e.permissions.map((e) => e.name) } : e
      )
  );

const listProcedure = protectedProcedure()
  .output(
    z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        discordId: z.string(),
        permissions: z.array(z.string()),
      })
    )
  )
  .query(({ ctx }) =>
    ctx.prisma.user
      .findMany({
        select: {
          id: true,
          name: true,
          discordId: true,
          permissions: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
      })
      .then((e) =>
        e.map((e) => ({ ...e, permissions: e.permissions.map((e) => e.name) }))
      )
  );

const createProcedure = protectedInputProcedure(
  z.object({
    name: z.string(),
    discordId: z.string(),
    permissions: z.array(z.string()),
  }),
  'CREATE_USER'
)
  .output(z.number())
  .mutation(
    async ({ input: { input }, ctx }) =>
      await ctx.prisma.user
        .create({
          data: {
            name: input.name,
            discordId: input.discordId,
            permissions: {
              createMany: {
                data: input.permissions.map((e) => ({ name: e as Permission })),
              },
            },
          },
          select: { id: true },
        })
        .then((e) => e.id)
  );

const updateProcedure = protectedInputProcedure(
  z.object({
    id: z.number(),
    name: z.string(),
    discordId: z.string(),
    permissions: z.array(z.string()),
  })
).mutation(
  async ({ input: { input }, ctx }) =>
    await ctx.prisma.user.update({
      where: { id: input.id },
      data: {
        name: input.name,
        discordId: input.discordId,
        permissions: {
          deleteMany: {},
          createMany: {
            data: input.permissions.map((e) => ({ name: e as Permission })),
          },
        },
      },
    })
);

const deleteProcedure = protectedInputProcedure(
  z.number(),
  'DELETE_USER'
).mutation(async ({ input: { input }, ctx }) => {
  await ctx.prisma.user.delete({ where: { id: input } });
});

export const usersRouter = router({
  detail: detailProcedure,
  list: listProcedure,
  create: createProcedure,
  update: updateProcedure,
  delete: deleteProcedure,
});
