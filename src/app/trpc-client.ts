import { AppRouter } from '../server/trpc/routers';
import { createTrpcClient } from '@analogjs/trpc';
import { inject } from '@angular/core';
import superjson from 'superjson';

export const { provideTrpcClient, TrpcClient } = createTrpcClient<AppRouter>({
  url: 'http://127.0.0.1:5173/api/trpc',
  options: {
    transformer: superjson,
  },
});

export function injectTRPCClient() {
  return inject(TrpcClient);
}
