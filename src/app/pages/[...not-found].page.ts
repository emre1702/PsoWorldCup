import { RouteMeta } from '@analogjs/router';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

export const routeMeta: RouteMeta = {
  data: { breadcrumb: 'Not Found' },
  title: 'Page not found',
};

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  host: {
    class: 'h-full flex flex-col items-center justify-center',
  },
  template: `
    <div class="-mt-[25%] flex items-center mb-8">
      <h1>404</h1>
      <hr class="h-8 mx-4" orientation="vertical" />
      <p>This page could not be found</p>
    </div>
    <a routerLink="/" size="sm" class="text-xs" variant="link">Back home</a>
  `,
})
export default class NotFoundComponent {}
