import { MediaMatcher } from '@angular/cdk/layout';
import { NgFor, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
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
          <a
            mat-list-item
            [routerLink]="nav.route"
            *ngFor="let nav of navigations"
            >{{ nav.name }}</a
          >
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="p-5">
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  </div> `,
})
export class AppComponent {
  navigations: { route: string; name: string }[] = [
    { route: '/teams', name: 'Teams' },
    { route: '/players', name: 'Players' },
    { route: '/matches', name: 'Matches' },
    { route: '/player-stats', name: 'Player Stats' },
  ];

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
}
