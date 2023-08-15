import { prisma } from './db';
import { H3Event } from 'h3';
import { createDiscordOAuth2 } from './helpers/discord-oauth2.helpers';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (event: H3Event) => {
  const discordAuthenticationToken = new URLSearchParams(
    event.node.req.url?.split('?')[1]
  ).get('token');
  console.log(event.node.req.url);
  const user =
    discordAuthenticationToken && discordAuthenticationToken !== 'undefined'
      ? await createDiscordOAuth2().getUser(
          discordAuthenticationToken as string
        )
      : undefined;

  return {
    prisma,
    req: event.node.req,
    res: event.node.res,
    user,
  };
};
