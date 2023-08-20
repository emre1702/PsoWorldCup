import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PlayersService } from '../../services/players.service';
import { TeamsService } from '../../services/teams.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouteMeta } from '@analogjs/router';
import {
  getAuth,
  getInputWithAuth,
  injectTRPCClient,
} from '../../../trpc-client';

export const routeMeta: RouteMeta = {
  title: 'Create Player',
  canActivate: [
    () =>
      injectTRPCClient().permissions.hasPermission.query(
        getInputWithAuth('CREATE_PLAYER')
      ),
  ],
};

@Component({
  selector: 'app-players-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: ` <form
    [formGroup]="formGroup"
    (ngSubmit)="createPlayer()"
    class="flex flex-col gap-4"
  >
    <mat-form-field>
      <mat-label>Name</mat-label>
      <input matInput [formControlName]="formFields.name" />
      <mat-error *ngIf="formGroup.get(formFields.name)?.hasError('required')">
        Name is required
      </mat-error>
      <mat-error *ngIf="formGroup.get(formFields.name)?.hasError('minlength')">
        Name must be at least 2 characters long
      </mat-error>
      <mat-error *ngIf="formGroup.get(formFields.name)?.hasError('maxlength')">
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
      Create Player
    </button>
  </form>`,
})
export default class PlayerCreateComponent {
  formFields = {
    name: 'name',
    teamId: 'teamId',
  };
  formGroup = new FormGroup({
    [this.formFields.name]: new FormControl('', {
      updateOn: 'blur',
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(500),
      ],
    }),
    [this.formFields.teamId]: new FormControl<number | null>(null, {
      updateOn: 'blur',
    }),
  });
  fileTooLarge = false;

  private readonly teamsService = inject(TeamsService);
  private readonly playersService = inject(PlayersService);
  private readonly router = inject(Router);

  readonly teams$ = this.teamsService.getTeams(getAuth());

  createPlayer() {
    const value = this.formGroup.value;
    this.playersService
      .createPlayer(
        getInputWithAuth({
          name: value[this.formFields.name] as string,
          teamId: value[this.formFields.teamId] as number | null,
        })
      )
      .subscribe(() => this.router.navigate(['/players']));
  }
}
