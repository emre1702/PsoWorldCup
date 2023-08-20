import { MediaMatcher } from '@angular/cdk/layout';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { getAuth, injectTRPCClient } from '../trpc-client';
import { firstValueFrom } from 'rxjs';
import { Permission } from '@prisma/client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    NgIf,
    NgFor,
    NgClass,
  ],
  template: `<div class="flex flex-col absolute top-0 left-0 bottom-0 right-0">
    <mat-toolbar
      color="primary"
      [ngClass]="{
        fixed: mobileQuery.matches,
        'z-20': mobileQuery.matches
      }"
    >
      <button mat-icon-button (click)="snav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <h1 class="pl-5">PSO World Cup</h1>
    </mat-toolbar>

    <mat-sidenav-container
      class="flex-1"
      [ngClass]="{
        'flex-shrink-0': mobileQuery.matches
      }"
      [style.marginTop.px]="mobileQuery.matches ? 56 : 0"
    >
      <mat-sidenav
        #snav
        [mode]="mobileQuery.matches ? 'over' : 'side'"
        [fixedInViewport]="mobileQuery.matches"
        fixedTopGap="56"
        opened
      >
        <mat-nav-list>
          <ng-container *ngFor="let nav of navigations">
            <a
              *ngIf="
                !nav.neededPermission ||
                permissions.includes(nav.neededPermission)
              "
              mat-list-item
              [routerLink]="nav.route"
              >{{ nav.name }}</a
            >
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="p-5">
        <router-outlet *ngIf="!loading"></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  </div> `,
})
export class AppComponent implements OnInit {
  private readonly trpcClient = injectTRPCClient();

  navigations: {
    route: string;
    name: string;
    neededPermission?: Permission;
  }[] = [
    { route: '/teams', name: 'Teams', neededPermission: 'SEE_TEAMS' },
    { route: '/players', name: 'Players', neededPermission: 'SEE_PLAYERS' },
    { route: '/matches', name: 'Matches', neededPermission: 'SEE_MATCHES' },
    { route: '/player-stats', name: 'Player Stats' },
    { route: '/users', name: 'Users', neededPermission: 'SEE_USERS' },
  ];

  mobileQuery: MediaQueryList;
  loading = true;
  permissions: string[] = [];
  private permissionsLoaded = false;

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private readonly router: ActivatedRoute
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.router.url.subscribe(() => this.onNavigate());
  }

  private async onNavigate() {
    if (this.permissionsLoaded) return;

    this.loading = true;
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('discord-token');
    if (window.location.pathname === '/auth/discord-callback' || token) {
      if (token) {
        this.trpcClient.permissions.getPermissions
          .query(getAuth())
          .subscribe((perms) => {
            this.permissions = perms;
            this.permissionsLoaded = true;
            this.loading = false;
          });
      } else {
        this.loading = false;
      }

      return;
    }

    const { authUrl, state } = await firstValueFrom(
      this.trpcClient.authentication.authUrl.query()
    );
    localStorage.setItem('discord-state', state);
    window.location.href = authUrl;
  }
}
