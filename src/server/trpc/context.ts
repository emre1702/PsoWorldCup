import { prisma } from './db';
import { H3Event } from 'h3';
import { User } from 'discord-oauth2';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (event: H3Event) => {
  return {
    prisma,
    req: event.node.req,
    res: event.node.res,
    user: undefined as User | undefined,
  };
};
