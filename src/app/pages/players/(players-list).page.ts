import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TeamsService } from '../../services/teams.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AsyncReturnType } from 'src/app/types/async-return-type';
import { ArrayReturnType } from 'src/app/types/array-return-type';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { PlayersService } from '../../services/players.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  getAuth,
  getInputWithAuth,
  injectTRPCClient,
} from '../../../trpc-client';
import { RouteMeta } from '@analogjs/router';
import { forkJoin } from 'rxjs';

export const routeMeta: RouteMeta = {
  title: 'Players',
  canActivate: [
    () =>
      injectTRPCClient().permissions.hasPermission.query(
        getInputWithAuth('SEE_PLAYERS')
      ),
  ],
};

@Component({
  selector: 'app-players-list',
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
          <td mat-cell *matCellDef="let player">{{ player.id }}</td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
          <td mat-cell *matCellDef="let player">{{ player.name }}</td>
        </ng-container>
        <ng-container matColumnDef="team">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Team</th>
          <td mat-cell *matCellDef="let player">
            <div class="flex flex-row gap-2">
              <img
                *ngIf="player.team && teamLogoById[player.team.id]"
                [src]="teamLogoById[player.team.id]"
                class="w-10 h-10"
              />
              <span class="self-center"> {{ player.team?.name }}</span>
            </div>
          </td>
        </ng-container>
        <ng-container matColumnDef="isCaptain">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Is captain</th>
          <!-- Use icon -->
          <td mat-cell *matCellDef="let player">
            <mat-icon>{{ player.isCaptain ? 'check' : 'close' }}</mat-icon>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let player">
            <a mat-icon-button [routerLink]="['/players/edit', player.id]">
              <mat-icon>edit</mat-icon>
            </a>
            <button
              mat-icon-button
              *ngIf="canDelete"
              (click)="deletePlayer(player.id)"
            >
              <mat-icon color="warn"> delete </mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let player; columns: displayedColumns"></tr>

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
export default class TeamsListComponent implements OnInit, AfterViewInit {
  private readonly teamsService = inject(TeamsService);
  private readonly playersService = inject(PlayersService);
  private readonly trpcClient = injectTRPCClient();

  displayedColumns: string[] = ['id', 'name', 'team', 'isCaptain', 'actions'];
  dataSource: MatTableDataSource<
    ArrayReturnType<AsyncReturnType<PlayersService['getPlayers']>>
  > = new MatTableDataSource();
  teamLogoById: { [id: number]: string } = {};
  canDelete = false;
  loading = true;

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  @ViewChild(MatSort) set sort(value: MatSort) {
    this.dataSource.sort = value;
  }

  ngOnInit() {
    forkJoin([
      this.playersService.getPlayers(getAuth()),
      this.teamsService.getTeams(getAuth()),
      this.trpcClient.permissions.hasPermission.query(
        getInputWithAuth('DELETE_PLAYER')
      ),
    ]).subscribe(([players, teams, canDelete]) => {
      this.dataSource.data = players;
      teams.forEach((team) => {
        if (!team.logo) return;
        this.teamLogoById[team.id] = team.logo;
      });
      this.canDelete = canDelete;
      this.loading = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'team':
          return item.team?.name;
        default:
          return (item as any)[property];
      }
    };
    this.dataSource.filterPredicate = (data, filter) =>
      data.name.toLowerCase().includes(filter.toLowerCase()) ||
      data.team?.name.toLowerCase().includes(filter.toLowerCase()) === true;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (!this.dataSource) return;

    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deletePlayer(id: number) {
    // with confirm
    if (!confirm('Are you sure you want to delete this player?')) return;
    this.playersService.deletePlayer(getInputWithAuth(id)).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(
        (player) => player.id !== id
      );
    });
  }
}
