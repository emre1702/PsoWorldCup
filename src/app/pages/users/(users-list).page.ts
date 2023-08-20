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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ArrayReturnType } from 'src/app/types/array-return-type';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  getAuth,
  getInputWithAuth,
  injectTRPCClient,
} from '../../../trpc-client';
import { RouterOutputs } from '../../../server/trpc/routers';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users-list',
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
      <button mat-raised-button routerLink="/users/create">Create User</button>

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
          <td mat-cell *matCellDef="let user">{{ user.id }}</td>
        </ng-container>
        <ng-container matColumnDef="discordId">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Discord Id</th>
          <td mat-cell *matCellDef="let user">{{ user.discordId }}</td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
          <td mat-cell *matCellDef="let user">{{ user.name }}</td>
        </ng-container>
        <ng-container matColumnDef="permissions">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Permissions</th>
          <td mat-cell *matCellDef="let user">
            {{ user.permissions.join(', ') }}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let user">
            <a mat-icon-button [routerLink]="['/users/edit', user.id]">
              <mat-icon>edit</mat-icon>
            </a>
            <button
              mat-icon-button
              *ngIf="canDelete"
              (click)="deleteUser(user.id)"
            >
              <mat-icon color="warn"> delete </mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let user; columns: displayedColumns"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" colspan="4">
            No data matching the filter "{{ input.value }}"
          </td>
        </tr>
      </table>

      <mat-paginator
        [pageSizeOptions]="[5, 10, 25, 100]"
        aria-label="Select page of users"
      ></mat-paginator>
    </div>`,
})
export default class UsersListComponent implements OnInit, AfterViewInit {
  private readonly trpcClient = injectTRPCClient();

  displayedColumns: string[] = [
    'id',
    'discordId',
    'name',
    'permissions',
    'actions',
  ];
  dataSource: MatTableDataSource<
    ArrayReturnType<RouterOutputs['users']['list']>
  > = new MatTableDataSource();
  loading = true;
  canDelete = false;

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  @ViewChild(MatSort) set sort(value: MatSort) {
    this.dataSource.sort = value;
  }

  ngOnInit() {
    forkJoin([
      this.trpcClient.permissions.hasPermission.query(
        getInputWithAuth('DELETE_USER')
      ),
      this.trpcClient.users.list.query(getAuth()),
    ]).subscribe(([canDelete, users]) => {
      this.canDelete = canDelete;
      this.dataSource.data = users;
      this.loading = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.filterPredicate = (data, filter) => {
      return (
        data.name.toLowerCase().includes(filter) ||
        data.discordId.toLowerCase().includes(filter) ||
        data.permissions.join(', ').toLowerCase().includes(filter)
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

  deleteUser(id: number) {
    this.trpcClient.users.delete.mutate(getInputWithAuth(id)).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(
        (user) => user.id !== id
      );
    });
  }
}
