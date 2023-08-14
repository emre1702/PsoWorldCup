import { prisma } from './db';
import type { H3Event } from 'h3';
import { createDiscordOAuth2 } from './helpers/discord-oauth2.helpers';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (event: H3Event) => {
  const discordAuthenticationToken = event.node.req.headers['Discord-Token'];
  console.log(discordAuthenticationToken);
  const user =
    discordAuthenticationToken && discordAuthenticationToken !== 'undefined'
      ? await createDiscordOAuth2().getUser(
          discordAuthenticationToken as string
        )
      : undefined;
  console.log(user);

  return {
    prisma,
    req: event.node.req,
    res: event.node.res,
    user,
  };
};
