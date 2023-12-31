import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { RouterOutputs } from '../../../server/trpc/routers';
import { NgFor, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArrayReturnType } from '../../types/array-return-type';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-team-stats-table',
  standalone: true,
  imports: [
    MatTableModule,
    NgIf,
    NgFor,
    MatProgressSpinnerModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="flex flex-row gap-4">
      <mat-form-field>
        <mat-label>Filter</mat-label>
        <input
          matInput
          (keyup)="applyFilter($event)"
          placeholder="Filter"
          #input
        />
      </mat-form-field>
    </div>

    <div class="mat-elevation-z8 overflow-auto">
      <mat-spinner *ngIf="loading"></mat-spinner>
      <table mat-table [dataSource]="dataSource" matSort *ngIf="!loading">
        <ng-container matColumnDef="team">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Team</th>
          <td mat-cell *matCellDef="let teamStats">
            <div class="flex flex-row gap-2">
              <img
                *ngIf="teamStats.team.logo"
                [src]="teamStats.team.logo"
                class="w-10 h-10"
              />
              <span class="self-center"> {{ teamStats.team.name }}</span>
            </div>
          </td>
        </ng-container>
        <ng-container
          *ngFor="let column of numberColumns"
          [matColumnDef]="column.key"
        >
          <th mat-header-cell *matHeaderCellDef mat-sort-header>
            {{ column.header }}
          </th>
          <td mat-cell *matCellDef="let teamStats">
            {{ teamStats[column.key] }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let teamStats; columns: displayedColumns"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="4">
            No data matching the filter "{{ input.value }}"
          </td>
        </tr>
      </table>

      <mat-paginator
        [pageSizeOptions]="[5, 10, 25, 100]"
        showFirstLastButtons
        aria-label="Select page of teams"
      ></mat-paginator>
    </div>
  `,
})
export default class TeamStatsTableComponent implements OnInit {
  @Input() loading = false;
  @Input() set teamStats(
    value:
      | RouterOutputs['teamStats']['listAverage']
      | RouterOutputs['teamStats']['listSum']
  ) {
    this.dataSource.data = value;
    this.table?.renderRows();
  }

  numberColumns: {
    header: string;
    key: keyof (ArrayReturnType<RouterOutputs['teamStats']['listAverage']> & {
      team: never;
    });
  }[] = [
    { header: 'Matches played', key: 'amountPlayed' },
    { header: 'Wins', key: 'wins' },
    { header: 'Losses', key: 'losses' },
    { header: 'Scored', key: 'scored' },
    { header: 'Conceded', key: 'conceded' },
    { header: 'Passes', key: 'passes' },
    { header: 'Assists', key: 'assists' },
    { header: 'Shots', key: 'shots' },
    { header: 'Goals', key: 'goals' },
    { header: 'TKLs', key: 'tackles' },
    { header: 'INTs', key: 'interceptions' },
    { header: 'Catches', key: 'catches' },
    { header: 'Saves', key: 'saves' },
  ];
  displayedColumns = ['team', ...this.numberColumns.map((c) => c.key)];
  dataSource = new MatTableDataSource<
    ArrayReturnType<RouterOutputs['teamStats']['listAverage']>
  >();

  @ViewChild(MatSort) set sort(value: MatSort) {
    this.dataSource.sort = value;
  }
  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  @ViewChild(MatTable) table?: MatTable<any>;

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data, filter) =>
      data.team.name.toLowerCase().includes(filter.toLowerCase());

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'team':
          return item.team.name.toLowerCase();
        default:
          return (item as any)[property];
      }
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (!this.dataSource) return;

    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
