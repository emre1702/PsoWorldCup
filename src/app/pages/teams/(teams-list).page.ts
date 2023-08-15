import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TeamsService } from '../../../app/services/teams.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AsyncReturnType } from 'src/app/types/async-return-type';
import { ArrayReturnType } from 'src/app/types/array-return-type';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { getAuth, getInputWithAuth } from '../../../trpc-client';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    CommonModule,
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
  ],
  template: ` <div class="flex flex-row gap-4">
      <button mat-raised-button routerLink="/teams/create">Create Team</button>

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
          <td mat-cell *matCellDef="let team">{{ team.id }}</td>
        </ng-container>
        <ng-container matColumnDef="logo">
          <th mat-header-cell *matHeaderCellDef>Logo</th>
          <td mat-cell *matCellDef="let team">
            <img [src]="team.logo" *ngIf="team.logo" class="w-10 h-10" />
          </td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
          <td mat-cell *matCellDef="let team">{{ team.name }}</td>
        </ng-container>
        <ng-container matColumnDef="captain">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Captain</th>
          <td mat-cell *matCellDef="let team">{{ team.captain }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let player">
            <a mat-icon-button [routerLink]="['/teams/edit', player.id]">
              <mat-icon>edit</mat-icon>
            </a>
            <button mat-icon-button (click)="deleteTeam(player.id)">
              <mat-icon color="warn"> delete </mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let team; columns: displayedColumns"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="4">
            No data matching the filter "{{ input.value }}"
          </td>
        </tr>
      </table>

      <mat-paginator
        [pageSizeOptions]="[5, 10, 25, 100]"
        aria-label="Select page of teams"
      ></mat-paginator>
    </div>`,
})
export default class TeamsListComponent implements OnInit, AfterViewInit {
  private readonly teamsService = inject(TeamsService);

  displayedColumns: string[] = ['id', 'logo', 'name', 'captain', 'actions'];
  dataSource: MatTableDataSource<
    ArrayReturnType<AsyncReturnType<TeamsService['getTeams']>>
  > = new MatTableDataSource();
  loading = true;

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  @ViewChild(MatSort) set sort(value: MatSort) {
    this.dataSource.sort = value;
  }

  ngOnInit() {
    this.teamsService.getTeams(getAuth()).subscribe((teams) => {
      this.dataSource.data = teams;
      this.loading = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.sortingDataAccessor = (team, property) => {
      switch (property) {
        case 'captain':
          return team.captain?.toLowerCase();
        default:
          return (team as any)[property];
      }
    };
    this.dataSource.filterPredicate = (data, filter) => {
      return (
        data.name.toLowerCase().includes(filter) ||
        data.captain?.toLowerCase().includes(filter) === true
      );
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

  deleteTeam(id: number) {
    this.teamsService.deleteTeam(getInputWithAuth(id)).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(
        (team) => team.id !== id
      );
    });
  }
}
