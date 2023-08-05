import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PlayersService } from '../../services/players.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamsService } from '../../services/teams.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team-edit',
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
      (ngSubmit)="updateTeam()"
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
          Name must be at least 3 characters long
        </mat-error>
        <mat-error
          *ngIf="formGroup.get(formFields.name)?.hasError('maxlength')"
        >
          Name cannot be more than 50 characters long
        </mat-error>
        <mat-error *ngIf="formGroup.get(formFields.name)?.hasError('pattern')">
          Name can only contain letters, numbers, and spaces
        </mat-error>
      </mat-form-field>

      <div class="flex flex-row">
        <div class="flex flex-col gap-1">
          <button type="button" mat-raised-button (click)="fileInput.click()">
            Select Logo
          </button>
          <input
            hidden
            (change)="selectLogo($event)"
            #fileInput
            type="file"
            accept="image/*"
          />
          <button
            type="button"
            mat-raised-button
            (click)="deleteLogo()"
            [disabled]="!formGroup.get(formFields.logo)?.value"
            color="warn"
          >
            Delete Logo
          </button>
        </div>

        <img
          class="ml-4 w-14 h-14"
          *ngIf="formGroup.get(formFields.logo)?.value"
          [src]="formGroup.get(formFields.logo)?.value"
        />
      </div>
      <mat-error *ngIf="fileTooLarge && formGroup.get(formFields.logo)?.value"
        >The logo file is too big. It must be less than 1 MB.</mat-error
      >

      <mat-form-field>
        <mat-label>Players</mat-label>
        <mat-select [formControlName]="formFields.players" multiple>
          <mat-option
            *ngFor="let player of playersWithoutTeam$ | async"
            [value]="player"
          >
            {{ player.name }}
          </mat-option>
        </mat-select>
        <mat-error
          *ngIf="formGroup.get(formFields.players)?.hasError('required')"
        >
          Atleast one player is required. Create the players if they don't exist
          yet.
        </mat-error>
        <mat-error
          *ngIf="formGroup.get(formFields.players)?.hasError('maxlength')"
        >
          A team can have a maximum of 20 players.
        </mat-error>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Captain</mat-label>
        <mat-select [formControlName]="formFields.captain" required>
          <mat-option
            *ngFor="let player of formGroup.get(formFields.players)?.value"
            [value]="player.id"
          >
            {{ player.name }}
          </mat-option>
        </mat-select>
        <mat-error
          *ngIf="formGroup.get(formFields.captain)?.hasError('required')"
        >
          Captain is required. Only players in the team can be captain.
        </mat-error>
        <mat-error
          *ngIf="formGroup.get(formFields.captain)?.hasError('isIdInTeam')"
        >
          Captain must be a player of the team.
        </mat-error>
      </mat-form-field>

      <button
        mat-raised-button
        color="primary"
        type="submit"
        [disabled]="!formGroup.valid"
      >
        Update Team
      </button>
    </form>`,
})
export default class TeamEditPage implements OnInit {
  @Input({ required: true }) teamId!: string;

  private readonly playersService = inject(PlayersService);
  private readonly teamsService = inject(TeamsService);
  private readonly router = inject(Router);

  readonly formFields = {
    name: 'name',
    logo: 'logo',
    captain: 'captain',
    players: 'players',
  };
  readonly formGroup = new FormGroup({
    [this.formFields.name]: new FormControl('', {
      updateOn: 'blur',
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9 ]+$/),
      ],
    }),
    [this.formFields.logo]: new FormControl<string | null>(null, {
      updateOn: 'blur',
    }),
    [this.formFields.captain]: new FormControl<{
      id: number;
      name: string;
    } | null>(null, {
      updateOn: 'blur',
      validators: [this.isIdInTeamValidator()],
    }),
    [this.formFields.players]: new FormControl<{ id: number; name: string }[]>(
      [],
      {
        updateOn: 'blur',
        validators: [Validators.maxLength(20)],
      }
    ),
  });
  playersWithoutTeam$ = this.playersService.getPlayersWithoutTeam();
  teams$ = this.teamsService.getTeams();
  fileTooLarge = false;
  loading = true;

  ngOnInit(): void {
    const teamIdNumber = Number(this.teamId);
    if (isNaN(teamIdNumber)) return;
    this.teamsService.getDetail(teamIdNumber).subscribe(async (team) => {
      this.loading = false;
      if (!team) return;

      this.formGroup.setValue({
        [this.formFields.name]: team.name,
        [this.formFields.logo]: team.logo,
        [this.formFields.captain]: team.captain,
        [this.formFields.players]: team.players,
      });
    });
  }

  updateTeam() {
    const teamIdNumber = Number(this.teamId);
    if (isNaN(teamIdNumber)) return;
    this.teamsService
      .updateTeam({
        name: this.formGroup.value[this.formFields.name] as string,
        logo: this.formGroup.value[this.formFields.logo] as string,
        captainId: (
          this.formGroup.value[this.formFields.captain] as { id: number }
        ).id,
        playerIds: (
          this.formGroup.value[this.formFields.players] as { id: number }[]
        ).map((e) => e.id),

        id: teamIdNumber,
      })
      .subscribe(() => this.router.navigate(['/teams']));
  }

  private isIdInTeamValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null;

      return this.formGroup
        .get(this.formFields.players)
        ?.value.some((player: { id: number }) => value === player.id)
        ? null
        : { isIdInTeam: true };
    };
  }

  deleteLogo() {
    this.formGroup.get(this.formFields.logo)?.setValue(undefined);
    this.fileTooLarge = false;
  }

  selectLogo(event: Event) {
    const file = (event?.target as HTMLInputElement)?.files?.[0];
    (event?.target as HTMLInputElement).value = '';
    if (!file) return;

    this.fileTooLarge = file.size >= 1024 * 1024 * 1;
    if (this.fileTooLarge) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.formGroup.get(this.formFields.logo)?.setValue(result);
    };
    reader.readAsDataURL(file);
  }
}
