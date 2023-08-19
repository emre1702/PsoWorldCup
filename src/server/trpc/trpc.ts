import {
  ProcedureType,
  TRPCError,
  inferAsyncReturnType,
  initTRPC,
} from '@trpc/server';
import { createContext } from './context';
import superjson from 'superjson';
import {
  createDiscordOAuth2,
  zodInputWithAuth,
} from './helpers/discord-oauth2.helpers';
import { ZodTypeAny, z } from 'zod';
import { PrismaClient, permission, user } from '@prisma/client';

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

const oauth = createDiscordOAuth2();
async function authorizationMiddleware(opts: {
  ctx: { user: user | null; prisma: PrismaClient };
  type: ProcedureType;
  path: string;
  input: { token?: string };
  next: (opts: { ctx: any }) => Promise<any>;
}) {
  const { token } = opts.input;
  if (!token || token === '-') throw new TRPCError({ code: 'UNAUTHORIZED' });

  try {
    opts.ctx.user = await getUser(token, opts.ctx.prisma);
  } catch (e) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: (typeof e === 'object' && e && 'message' in e
        ? e.message
        : e) as string,
    });
  }

  if (!opts.ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });

  // Log the action of the user
  await opts.ctx.prisma.log.create({
    data: {
      user: { connect: { id: opts.ctx.user.id } },
      input: JSON.stringify(opts.input),
      type: opts.type,
      path: opts.path,
    },
  });

  return opts.next(opts);
}

async function getUser(
  token: string,
  prisma: PrismaClient
): Promise<user & { permissions: permission[] }> {
  const discordUser = await oauth.getUser(token);
  let user = await prisma.user.findUnique({
    where: { discordId: discordUser.id },
    include: { permissions: true },
  });
  if (!user)
    user = await prisma.user
      .create({
        data: { discordId: discordUser.id, name: discordUser.username },
      })
      .then((u) =>
        prisma.user.findUnique({
          where: { id: u.id },
          include: { permissions: true },
        })
      );
  return user!;
}

export const protectedInputProcedure = <T extends ZodTypeAny>(input: T) =>
  publicProcedure.input(zodInputWithAuth(input)).use(authorizationMiddleware);

export const protectedProcedure = publicProcedure
  .input(zodInputWithAuth(z.null().optional()))
  .use(authorizationMiddleware);
