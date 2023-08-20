import { Permission } from '@prisma/client';
import {
  protectedInputProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from '../trpc';
import { z } from 'zod';

const listNamesProcedure = publicProcedure
  .output(z.array(z.string()))
  .query(() => Object.values(Permission));

const hasPermissionProcedure = protectedInputProcedure(z.nativeEnum(Permission))
  .output(z.boolean())
  .query(
    ({ input: { input }, ctx }) =>
      ctx.user?.permissions.some((e) => e.name === input) ?? false
  );

const getPermissionsProcedure = protectedProcedure()
  .output(z.array(z.nativeEnum(Permission)))
  .query(({ ctx }) => ctx.user?.permissions.map((e) => e.name) ?? []);

export const permissionsRouter = router({
  hasPermission: hasPermissionProcedure,
  getPermissions: getPermissionsProcedure,
  listNames: listNamesProcedure,
});
