import { Component } from '@angular/core';
import { getAuth, injectTRPCClient } from '../../../trpc-client';
import { MatRadioModule } from '@angular/material/radio';
import { RouterOutputs } from '../../../server/trpc/routers';
import { NgFor, NgIf } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import TeamStatsTableComponent from './team-stats-table.component';

@Component({
  selector: 'app-team-stats-list',
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
        (click)="loadTeamStats(group.value)"
      >
        Load
      </button>
    </div>

    <app-team-stats-table
      *ngIf="teamStats"
      [loading]="loading"
      [teamStats]="teamStats!"
    ></app-team-stats-table>`,
  imports: [
    TeamStatsTableComponent,
    MatRadioModule,
    NgFor,
    NgIf,
    MatButtonModule,
  ],
})
export default class TeamStatsListComponent {
  trpcClient = injectTRPCClient();

  loading = true;
  teamStats?:
    | RouterOutputs['teamStats']['listAverage']
    | RouterOutputs['teamStats']['listSum'];
  loadOptions: { name: string; loadFunc: () => Observable<any> }[] = [
    {
      name: 'Average',
      loadFunc: () =>
        this.trpcClient.teamStats.listAverage
          .query(getAuth())
          .pipe(tap((e) => (this.teamStats = e))),
    },
    {
      name: 'Sum',
      loadFunc: () =>
        this.trpcClient.teamStats.listSum
          .query(getAuth())
          .pipe(tap((e) => (this.teamStats = e))),
    },
  ];

  loadTeamStats(option: string) {
    this.loading = true;
    this.teamStats = [];
    this.loadOptions
      .find((e) => e.name === option)
      ?.loadFunc()
      .subscribe({
        complete: () => (this.loading = false),
      });
  }
}
