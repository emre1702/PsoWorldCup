import { Component } from '@angular/core';
import PlayerStatsTableComponent from './player-stats-table.component';
import { injectTRPCClient } from '../../trpc-client';
import { MatRadioModule } from '@angular/material/radio';
import { RouterOutputs } from '../../../server/trpc/routers';
import { NgFor, NgIf } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-player-stats-list',
  standalone: true,
  template: ` <div class="flex flex-row gap-12">
      <mat-radio-group #group="matRadioGroup">
        <mat-radio-button
          *ngFor="let option of loadOptions"
          [value]="option.name"
          (click)="option.loadFunc()"
          >{{ option.name }}</mat-radio-button
        >
      </mat-radio-group>

      <button
        mat-raised-button
        color="primary"
        (click)="loadPlayerStats(group.value)"
      >
        Load
      </button>
    </div>

    <app-player-stats-table
      *ngIf="playerStats"
      [loading]="loading"
      [playerStats]="playerStats!"
    ></app-player-stats-table>`,
  imports: [
    PlayerStatsTableComponent,
    MatRadioModule,
    NgFor,
    NgIf,
    MatButtonModule,
  ],
})
export default class PlayerStatsListComponent {
  trpcClient = injectTRPCClient();

  loading = true;
  playerStats?:
    | RouterOutputs['playerStats']['listAverage']
    | RouterOutputs['playerStats']['listSum'];
  loadOptions: { name: string; loadFunc: () => Observable<any> }[] = [
    {
      name: 'Average',
      loadFunc: () =>
        this.trpcClient.playerStats.listAverage
          .query()
          .pipe(tap((e) => (this.playerStats = e))),
    },
    {
      name: 'Sum',
      loadFunc: () =>
        this.trpcClient.playerStats.listSum
          .query()
          .pipe(tap((e) => (this.playerStats = e))),
    },
  ];

  loadPlayerStats(option: string) {
    this.loading = true;
    this.playerStats = [];
    this.loadOptions
      .find((e) => e.name === option)
      ?.loadFunc()
      .subscribe({
        complete: () => (this.loading = false),
      });
  }
}
