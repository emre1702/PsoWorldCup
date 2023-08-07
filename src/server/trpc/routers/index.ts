import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from '../trpc';
import { teamsRouter } from './teams';
import { playersRouter } from './players';
import { matchesRouter } from './matches';

export const appRouter = router({
  teams: teamsRouter,
  players: playersRouter,
  matches: matchesRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
