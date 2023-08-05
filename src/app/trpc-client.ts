import { AppRouter } from '../server/trpc/routers';
import { createTrpcClient } from '@analogjs/trpc';
import { inject } from '@angular/core';
import superjson from 'superjson';

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';
  if (process.env['VERCEL_URL'])
    // reference for vercel.com
    return `https://${process.env['VERCEL_URL']}`;
  if (process.env['RENDER_INTERNAL_HOSTNAME'])
    // reference for render.com
    return `http://${process.env['RENDER_INTERNAL_HOSTNAME']}:${process.env['PORT']}`;
  // assume localhost
  return `http://localhost:${process.env['PORT'] ?? 3000}`;
}

export const { provideTrpcClient, TrpcClient } = createTrpcClient<AppRouter>({
  url: `${getBaseUrl()}/api/trpc`,
  options: {
    transformer: superjson,
  },
});

export function injectTRPCClient() {
  return inject(TrpcClient);
}
