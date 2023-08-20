import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from '../trpc';
import { teamsRouter } from './teams';
import { playersRouter } from './players';
import { matchesRouter } from './matches';
import { playerStatsRouter } from './player-stats';
import { authenticationRouter } from './authentication';
import { usersRouter } from './users';
import { permissionsRouter } from './permissions';
import { teamStatsRouter } from './team-stats';

export const appRouter = router({
  teams: teamsRouter,
  players: playersRouter,
  matches: matchesRouter,
  playerStats: playerStatsRouter,
  teamStats: teamStatsRouter,
  authentication: authenticationRouter,
  users: usersRouter,
  permissions: permissionsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
