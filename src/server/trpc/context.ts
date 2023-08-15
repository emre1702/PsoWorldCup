import { prisma } from './db';
import { getRequestHeader, H3Event } from 'h3';
import { createDiscordOAuth2 } from './helpers/discord-oauth2.helpers';
import { outputAllValuesRecursive } from '../../helpers/object.helpers';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (event: H3Event) => {
  const discordAuthenticationToken = getRequestHeader(event, 'authorization');
  const { socket, ...logThis } = event.node.req;
  outputAllValuesRecursive(event.context);

  
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
