import DiscordOauth2 from 'discord-oauth2';
import { ZodTypeAny, z } from 'zod';
import { publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export function createDiscordOAuth2() {
  const config = {
    clientId: process.env['DISCORD_CLIENT_ID'],
    clientSecret: process.env['DISCORD_CLIENT_SECRET'],
    redirectUri: process.env['DISCORD_REDIRECT_URI'],
  };
  return new DiscordOauth2(config);
}

export function zodInputWithAuth<T extends ZodTypeAny | z.ZodNull>(input: T): z.ZodObject<{ input: T; token: z.ZodString }, 'strip'> {
  return z.object({
    token: z.string().min(1),
    input,
  });
} 

export const protectedInputProcedure = <T extends ZodTypeAny>(input: T) => publicProcedure
  .input(zodInputWithAuth(input))
  .use(async (opts) => {
    const { token } = opts.input;
    if (!token || token === '-') throw new TRPCError({ code: 'UNAUTHORIZED' });

    try {
      const oauth = createDiscordOAuth2();
      opts.ctx.user = await oauth.getUser(token);
    }
    catch (e) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: (typeof e === 'object' && e && 'message' in e ? e.message : e) as string });
    }
    return opts.next(opts);
  })

export const protectedProcedure = publicProcedure
  .input(zodInputWithAuth(z.null().optional()))
  .use(async (opts) => {
    const { token } = opts.input;
    if (!token || token === '-') throw new TRPCError({ code: 'UNAUTHORIZED' });

    try {
      const oauth = createDiscordOAuth2();
      opts.ctx.user = await oauth.getUser(token);
    }
    catch (e) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: (typeof e === 'object' && e && 'message' in e ? e.message : e) as string });
    }
    return opts.next(opts);
  })