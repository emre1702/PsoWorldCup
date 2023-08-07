import { DatePipe, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import { TeamsService } from '../../services/teams.service';
import { ArrayReturnType } from '../../types/array-return-type';
import { AsyncReturnType } from '../../types/async-return-type';

@Component({
  selector: 'app-list-matches',
  standalone: true,
  imports: [
    RouterModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgIf,
    DatePipe,
  ],
  template: ` <div class="flex flex-row gap-4">
      <button mat-raised-button routerLink="/players/create">
        Create Player
      </button>

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

    <div class="mat-elevation-z8">
      <mat-spinner *ngIf="loading"></mat-spinner>
      <table mat-table [dataSource]="dataSource" matSort *ngIf="!loading">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Id</th>
          <td mat-cell *matCellDef="let match">{{ match.id }}</td>
        </ng-container>
        <ng-container matColumnDef="home">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Home</th>
          <td mat-cell *matCellDef="let match">{{ match.team1 }}</td>
        </ng-container>
        <ng-container matColumnDef="away">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Away</th>
          <td mat-cell *matCellDef="let match">{{ match.team2 }}</td>
        </ng-container>
        <ng-container matColumnDef="score">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Score</th>
          <td mat-cell *matCellDef="let match">
            {{ match.team1_score }} - {{ match.team2_score }}
          </td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
          <td mat-cell *matCellDef="let match">{{ match.date | date }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let match">
            <a mat-icon-button [routerLink]="['/matches/edit', match.id]">
              <mat-icon>edit</mat-icon>
            </a>
            <button mat-icon-button (click)="deleteMatch(match.id)">
              <mat-icon color="warn"> delete </mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let match; columns: displayedColumns"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="4">
            No data matching the filter "{{ input.value }}"
          </td>
        </tr>
      </table>

      <mat-paginator
        [pageSizeOptions]="[5, 10, 25, 100]"
        aria-label="Select page of players"
      ></mat-paginator>
    </div>`,
})
export default class ListMatchesComponent {
  matchesService = inject(MatchesService);
  teamsService = inject(TeamsService);

  displayedColumns: string[] = [
    'id',
    'home',
    'away',
    'score',
    'date',
    'actions',
  ];
  dataSource: MatTableDataSource<
    ArrayReturnType<AsyncReturnType<MatchesService['getMatches']>>
  > = new MatTableDataSource();
  teamLogoById: { [id: number]: string } = {};
  loading = true;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  ngOnInit() {
    this.matchesService.getMatches().subscribe((matches) => {
      this.dataSource.data = matches;
      this.loading = false;
    });
    this.teamsService.getTeams().subscribe((teams) => {
      teams.forEach((team) => {
        if (!team.logo) return;
        this.teamLogoById[team.id] = team.logo;
      });
    });
  }

  ngAfterViewInit() {
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data, filter) =>
      data.team1.toLowerCase().includes(filter.toLowerCase()) ||
      data.team2.toLowerCase().includes(filter.toLowerCase());
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (!this.dataSource) return;

    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteMatch(id: number) {
    // with confirm
    if (!confirm('Are you sure you want to delete this match?')) return;
    this.matchesService.deleteMatch(id).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(
        (match) => match.id !== id
      );
    });
  }
}
