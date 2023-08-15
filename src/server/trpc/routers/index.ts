import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from '../trpc';
import { teamsRouter } from './teams';
import { playersRouter } from './players';
import { matchesRouter } from './matches';
import { playerStatsRouter } from './player-stats';
import { authenticationRouter } from './authentication';

export const appRouter = router({
  teams: teamsRouter,
  players: playersRouter,
  matches: matchesRouter,
  playerStats: playerStatsRouter,
  authentication: authenticationRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
