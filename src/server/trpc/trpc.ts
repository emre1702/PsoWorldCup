import { TRPCError, inferAsyncReturnType, initTRPC } from '@trpc/server';
import { createContext } from './context';
import superjson from 'superjson';
import {
  createDiscordOAuth2,
  zodInputWithAuth,
} from './helpers/discord-oauth2.helpers';
import { ZodTypeAny, z } from 'zod';

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

export const protectedInputProcedure = <T extends ZodTypeAny>(input: T) =>
  publicProcedure.input(zodInputWithAuth(input)).use(async (opts) => {
    console.log(opts);
    const { token } = opts.input;
    if (!token || token === '-') throw new TRPCError({ code: 'UNAUTHORIZED' });

    try {
      const oauth = createDiscordOAuth2();
      opts.ctx.user = await oauth.getUser(token);
    } catch (e) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: (typeof e === 'object' && e && 'message' in e
          ? e.message
          : e) as string,
      });
    }
    return opts.next(opts);
  });

export const protectedProcedure = publicProcedure
  .input(zodInputWithAuth(z.null().optional()))
  .use(async (opts) => {
    console.log(opts);
    const { token } = opts.input;
    if (!token || token === '-') throw new TRPCError({ code: 'UNAUTHORIZED' });

    try {
      const oauth = createDiscordOAuth2();
      opts.ctx.user = await oauth.getUser(token);
    } catch (e) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: (typeof e === 'object' && e && 'message' in e
          ? e.message
          : e) as string,
      });
    }
    return opts.next(opts);
  });
