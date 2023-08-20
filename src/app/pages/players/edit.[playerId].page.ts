import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PlayersService } from '../../../app/services/players.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamsService } from '../../../app/services/teams.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {
  getAuth,
  getInputWithAuth,
  injectTRPCClient,
} from '../../../trpc-client';
import { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
  title: 'Edit Player',
  canActivate: [
    () =>
      injectTRPCClient().permissions.hasPermission.query(
        getInputWithAuth('UPDATE_PLAYER')
      ),
  ],
};

@Component({
  selector: 'app-players-edit',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    AsyncPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  template: ` <mat-spinner *ngIf="loading"></mat-spinner>
    <form
      *ngIf="!loading"
      class="flex flex-col gap-3"
      [formGroup]="formGroup"
      (ngSubmit)="updatePlayer()"
    >
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput [formControlName]="formFields.name" />
        <mat-error *ngIf="formGroup.get(formFields.name)?.hasError('required')">
          Name is required
        </mat-error>
        <mat-error
          *ngIf="formGroup.get(formFields.name)?.hasError('minlength')"
        >
          Name must be at least 2 characters long
        </mat-error>
        <mat-error
          *ngIf="formGroup.get(formFields.name)?.hasError('maxlength')"
        >
          Name cannot be more than 500 characters long
        </mat-error>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Team</mat-label>
        <mat-select [formControlName]="formFields.teamId">
          <mat-option [value]="null">None</mat-option>
          <mat-option *ngFor="let team of teams$ | async" [value]="team.id">
            {{ team.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <button
        mat-raised-button
        color="primary"
        type="submit"
        [disabled]="!formGroup.valid"
      >
        Update Player
      </button>
    </form>`,
})
export default class PlayerEditPage implements OnInit {
  @Input({ required: true }) playerId!: string;

  private readonly playersService = inject(PlayersService);
  private readonly teamsService = inject(TeamsService);
  private readonly router = inject(Router);

  formFields = {
    name: 'name',
    teamId: 'teamId',
  };
  formGroup = new FormGroup({
    [this.formFields.name]: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(500),
    ]),
    [this.formFields.teamId]: new FormControl<number | null>(null),
  });
  teams$ = this.teamsService.getTeams(getAuth());
  loading = true;

  ngOnInit(): void {
    const playerIdNumber = Number(this.playerId);
    if (isNaN(playerIdNumber)) return;
    this.playersService
      .getPlayer(getInputWithAuth(playerIdNumber))
      .subscribe((player) => {
        this.loading = false;
        if (!player) return;
        this.formGroup.setValue({
          [this.formFields.name]: player.name,
          [this.formFields.teamId]: player.teamId,
        });
      });
  }

  updatePlayer() {
    const playerIdNumber = Number(this.playerId);
    if (isNaN(playerIdNumber)) return;
    this.playersService
      .updatePlayer(
        getInputWithAuth({
          name: this.formGroup.value[this.formFields.name] as string,
          teamId: this.formGroup.value[this.formFields.teamId] as number,
          id: playerIdNumber,
        })
      )
      .subscribe(() => this.router.navigate(['/players']));
  }
}
