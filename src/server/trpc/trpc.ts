import { TRPCError, inferAsyncReturnType, initTRPC } from '@trpc/server';
import { createContext } from './context';
import superjson from 'superjson';

const t = initTRPC
  .context<inferAsyncReturnType<typeof createContext>>()
  .create({
    transformer: superjson,
  });
/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;
export const router = t.router;
export const middleware = t.middleware;

const isAuthed = middleware((opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next(opts);
});
export const protectedProcedure = t.procedure.use(isAuthed);
