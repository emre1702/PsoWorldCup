import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { injectTRPCClient } from '../../trpc-client';
import { firstValueFrom, of } from 'rxjs';
import { JsonPipe, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterOutputs } from '../../../server/trpc/routers';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-discord-callback',
  standalone: true,
  imports: [NgIf, MatProgressSpinnerModule, JsonPipe],
  host: { ngSkipHydration: 'true' },
  template: `
    <div
      *ngIf="loading"
      class="flex flex-col items-center justify-center h-screen"
    >
      <mat-spinner></mat-spinner>
    </div>
    <div *ngIf="!loading">
      <h1>Logged in as {{ user?.username }}</h1>
      {{ user | json }}
    </div>
  `,
})
export default class DiscordCallbackPage implements OnInit {
  private trpcClient = injectTRPCClient();

  loading = true;

  user?: RouterOutputs['authentication']['discordUser'];

  constructor(
    private readonly router: ActivatedRoute,
    private readonly ngZone: NgZone
  ) {}

  async ngOnInit() {
    let accessToken = localStorage.getItem('discord-token');
    if (accessToken) {
      this.loadDiscordUser(accessToken);
      return;
    }

    const { code, state } = this.getCallbackValues();
    if (!code || !state) return;
    const storedState = localStorage.getItem('discord-state');

    // Refresh page
    if (state !== storedState || !code) {
      this.handleInvalidState();
      return;
    }

    accessToken = await this.handleValidState(code);
    this.loadDiscordUser(accessToken);
  }

  private getCallbackValues() {
    const code = this.router.snapshot.queryParamMap.get('code');
    const state = this.router.snapshot.queryParamMap.get('state');
    return {
      code,
      state,
    };
  }

  private handleInvalidState() {
    localStorage.removeItem('discord-token');
    localStorage.removeItem('discord-refresh-token');
    localStorage.removeItem('discord-state');
    window.location.href = '/';
  }

  private async handleValidState(code: string) {
    const authToken = await firstValueFrom(
      this.trpcClient.authentication.authToken.query(code)
    );
    localStorage.setItem('discord-token', authToken.access_token);
    localStorage.setItem('discord-refresh-token', authToken.refresh_token);
    localStorage.removeItem('discord-state');
    return authToken.access_token;
  }

  private loadDiscordUser(token: string) {
    this.trpcClient.authentication.discordUser
      .query(token)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => (this.loading = false));
        }),
        catchError(() => {
          this.handleInvalidState();
          return of(undefined);
        })
      )
      .subscribe((user) => {
        if (user) this.ngZone.run(() => (this.user = user));
      });
  }
}
