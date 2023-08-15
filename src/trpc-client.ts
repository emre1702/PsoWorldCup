import { AppRouter } from './server/trpc/routers';
import { createTrpcClient } from '@analogjs/trpc';
import { inject } from '@angular/core';
import { TRPCLink, httpBatchLink } from '@trpc/client';
import { observable, tap } from '@trpc/server/observable';
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

const unauthorizedHandlerLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const subscription = next(op).subscribe({
        next: (result) => {
          console.log(result);
          observer.next(result);
        },
        error: (error) => {
          if (
            error.message.startsWith('DiscordHTTPError: 401') ||
            error.data?.code === 'UNAUTHORIZED' ||
            (error.meta?.['response'] as Response)?.status === 401
          ) {
            localStorage.removeItem('discord-token');
            localStorage.removeItem('discord-state');
            window.location.reload();
          }
          observer.error(error);
        },
        complete: () => {
          observer.complete();
        },
      });
      return subscription;
    });
  };
};

export const { provideTrpcClient, TrpcClient, TrpcHeaders } = createTrpcClient<AppRouter>({
  url: `${getBaseUrl()}/api/trpc`,
  options: {
    transformer: superjson,
    links: [
      unauthorizedHandlerLink,
    ],
  },
});

export function injectTRPCClient() {
  return inject(TrpcClient);
}
