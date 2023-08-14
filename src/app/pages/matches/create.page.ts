import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouteMeta } from '@analogjs/router';
import { injectTRPCClient } from '../../../trpc-client';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { RouterInputs, RouterOutputs } from 'src/server/trpc/routers';
import { ArrayReturnType } from 'src/app/types/array-return-type';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { map, pairwise, startWith } from 'rxjs/operators';
import { merge } from 'rxjs';

export const routeMeta: RouteMeta = {
  title: 'Create match',
};

@Component({
  selector: 'app-matches-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatTableModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  template: ` <form
    [formGroup]="formGroup"
    (ngSubmit)="createMatch()"
    class="flex flex-col gap-4"
  >
    <mat-form-field>
      <mat-label>Home</mat-label>
      <mat-select [formControlName]="formFields.team1Id">
        <ng-container *ngFor="let team of teams">
          <mat-option
            *ngIf="team.id !== formGroup.value[formFields.team2Id]"
            [value]="team.id"
          >
            {{ team.name }}
          </mat-option>
        </ng-container>
      </mat-select>
    </mat-form-field>

    <mat-form-field>
      <mat-label>Away</mat-label>
      <mat-select [formControlName]="formFields.team2Id">
        <ng-container *ngFor="let team of teams">
          <mat-option
            *ngIf="team.id !== formGroup.value[formFields.team1Id]"
            [value]="team.id"
          >
            {{ team.name }}
          </mat-option>
        </ng-container>
      </mat-select>
    </mat-form-field>

    <mat-form-field>
      <mat-label>Date</mat-label>
      <input
        matInput
        [matDatepicker]="picker"
        [formControlName]="formFields.date"
      />
      <mat-hint>MM/DD/YYYY</mat-hint>
      <mat-datepicker-toggle
        matIconSuffix
        [for]="picker"
      ></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>

    <mat-form-field>
      <mat-label>Round</mat-label>
      <input matInput [formControlName]="formFields.round" type="number" />
    </mat-form-field>

    <mat-form-field>
      <mat-label>Home Score</mat-label>
      <input matInput [formControlName]="formFields.team1Score" type="number" />
    </mat-form-field>

    <mat-form-field>
      <mat-label>Away Score</mat-label>
      <input matInput [formControlName]="formFields.team2Score" type="number" />
    </mat-form-field>

    <div
      class="mat-elevation-z8 overflow-auto"
      *ngFor="let teamIndex of [0, 1]"
    >
      <button
        mat-raised-button
        [disabled]="!playersOfTeam[teamIndex].length"
        (click)="addTeamPlayer(teamIndex)"
        type="button"
      >
        Add {{ teamIndex === 0 ? 'Home' : 'Away' }} Player
      </button>
      <table
        mat-table
        [dataSource]="playersDataSource[teamIndex]"
        class="mat-elevation-z8"
        [formArrayName]="formFields.statistics"
      >
        <ng-container matColumnDef="player" [formGroupName]="teamIndex">
          <th mat-header-cell *matHeaderCellDef>Player</th>
          <td
            mat-cell
            *matCellDef="let element; let index = index"
            [formGroupName]="index"
          >
            <mat-form-field>
              <mat-label>Player</mat-label>
              <mat-select formControlName="player">
                <mat-option [value]="null">Please select ...</mat-option>
                <ng-container *ngFor="let player of playersOfTeam[teamIndex]">
                  <mat-option
                    *ngIf="
                      !isPlayerAlreadySelectedByOther(
                        teamIndex,
                        index,
                        player.id
                      )
                    "
                    [value]="player.id"
                  >
                    {{ player.name }}
                  </mat-option>
                </ng-container>
              </mat-select>
            </mat-form-field>
          </td>
        </ng-container>

        <ng-container
          *ngFor="let stat of numberStats"
          [matColumnDef]="stat"
          [formGroupName]="teamIndex"
        >
          <th mat-header-cell *matHeaderCellDef>{{ stat }}</th>
          <td
            mat-cell
            *matCellDef="let element; let index = index"
            [formGroupName]="index"
          >
            <mat-form-field>
              <mat-label>{{ stat }}</mat-label>
              <input matInput [formControlName]="stat" type="number" />
            </mat-form-field>
          </td>
        </ng-container>

        <ng-container matColumnDef="Actions" [formGroupName]="teamIndex">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td
            mat-cell
            *matCellDef="let player; let index = index"
            [formGroupName]="index"
          >
            <button
              mat-icon-button
              type="button"
              (click)="removePlayerFromStats(teamIndex, index)"
            >
              <mat-icon color="warn"> delete </mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedStatsColumns"></tr>
        <tr
          mat-row
          *matRowDef="let row; let i = index; columns: displayedStatsColumns"
        ></tr>
      </table>
    </div>

    <button
      mat-raised-button
      color="primary"
      type="submit"
      [disabled]="!formGroup.valid"
    >
      Create Match
    </button>
  </form>`,
})
export default class PlayerCreateComponent implements OnInit {
  formFields = {
    date: 'date',
    round: 'round',
    team1Id: 'team1Id',
    team2Id: 'team2Id',
    team1Score: 'team1Score',
    team2Score: 'team2Score',
    statistics: 'statistics',
  };
  formGroup = new FormGroup({
    [this.formFields.date]: new FormControl<Date | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    [this.formFields.round]: new FormControl<number | null>(null, {
      updateOn: 'blur',
      validators: [
        Validators.required,
        Validators.max(100),
        Validators.min(0),
        Validators.pattern('^[0-9]*$'),
      ],
    }),
    [this.formFields.team1Id]: new FormControl<number | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    [this.formFields.team2Id]: new FormControl<number | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    [this.formFields.team1Score]: new FormControl<number>(0, {
      updateOn: 'blur',
      validators: [
        Validators.required,
        Validators.max(100),
        Validators.min(0),
        Validators.pattern('^[0-9]*$'),
      ],
    }),
    [this.formFields.team2Score]: new FormControl<number>(0, {
      updateOn: 'blur',
      validators: [
        Validators.required,
        Validators.max(100),
        Validators.min(0),
        Validators.pattern('^[0-9]*$'),
      ],
    }),
    [this.formFields.statistics]: new FormArray([
      new FormArray<FormGroup<any>>([], {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      new FormArray<FormGroup<any>>([], {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
    ]),
  });
  displayedStatsColumns = [
    'player',
    'Score',
    'Passes',
    'Assists',
    'Shots',
    'Goals',
    'TKLs',
    'INTs',
    'Catches',
    'Saves',
    'Actions',
  ];
  numberStats = [
    'Score',
    'Passes',
    'Assists',
    'Shots',
    'Goals',
    'TKLs',
    'INTs',
    'Catches',
    'Saves',
  ];
  playersDataSource: [
    MatTableDataSource<ArrayReturnType<RouterOutputs['players']['listByTeam']>>,
    MatTableDataSource<ArrayReturnType<RouterOutputs['players']['listByTeam']>>
  ] = [new MatTableDataSource(), new MatTableDataSource()];
  playersOfTeam: [
    RouterOutputs['players']['listByTeam'],
    RouterOutputs['players']['listByTeam']
  ] = [[], []];

  private readonly trpcClient = injectTRPCClient();
  private readonly router = inject(Router);

  teams: RouterOutputs['teams']['list'] = [];

  @ViewChildren(MatTable) tables?: QueryList<MatTable<any>>;

  ngOnInit(): void {
    this.trpcClient.teams.list.query().subscribe((e) => {
      this.teams = e;
    });
    merge(
      (
        this.formGroup.controls[this.formFields.team1Id] as FormControl<number>
      ).valueChanges.pipe(map((e) => ({ value: e, index: 0 }))),
      (
        this.formGroup.controls[this.formFields.team2Id] as FormControl<number>
      ).valueChanges.pipe(map((e) => ({ value: e, index: 1 })))
    )
      .pipe(startWith({ value: 0, index: -1 }), pairwise())
      .subscribe(([oldValue, newValue]) => {
        this.teamChanged(newValue.value, oldValue.value, newValue.index);
      });
  }

  createMatch() {
    const value = this.formGroup.value;
    console.log(value);
    this.trpcClient.matches.create
      .mutate({
        date: value[this.formFields.date] as Date,
        round: value[this.formFields.round] as number,
        team1Id: value[this.formFields.team1Id] as number,
        team2Id: value[this.formFields.team2Id] as number,
        team1Score: value[this.formFields.team1Score] as number,
        team2Score: value[this.formFields.team2Score] as number,
        statistics: (value[this.formFields.statistics] as any[][]).flatMap(
          (e) =>
            e.map((e) => ({
              playerId: e.player as number,
              score: e.Score as number,
              goals: e.Goals as number,
              assists: e.Assists as number,
              catches: e.Catches as number,
              interceptions: e.INTs as number,
              tackles: e.TKLs as number,
              passes: e.Passes as number,
              saves: e.Saves as number,
              shots: e.Shots as number,
              teamId: e.teamId as number,
            }))
        ),
      })
      .subscribe(() => this.router.navigate(['/matches']));
  }

  teamChanged(teamId: number, previousTeamId: number, teamIndex: number) {
    this.playersDataSource[teamIndex].data = [];
    const statsFormArray = this.formGroup.controls[
      this.formFields.statistics
    ] as FormArray;
    (
      (statsFormArray.controls[teamIndex] as FormArray)
        .controls as FormGroup<any>[]
    ).forEach((e) => {
      if (e.value['teamId'] === teamId) {
        statsFormArray.removeAt(statsFormArray.controls.indexOf(e));
      }
    });
    this.trpcClient.players.listByTeam.query(teamId).subscribe((e) => {
      this.playersOfTeam[teamIndex] = e;
    });

    this.tables?.get(teamIndex)?.renderRows();
  }

  addTeamPlayer(teamIndex: number) {
    const statFormGroup = new FormGroup<any>({
      player: new FormControl<number | null>(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      teamId: new FormControl<number>(
        this.formGroup.value[
          this.formFields[
            ('team' + (teamIndex + 1) + 'Id') as 'team1Id' | 'team2Id'
          ]
        ] as number,
        {
          validators: [Validators.required],
        }
      ),
    });
    for (const stat of this.numberStats) {
      statFormGroup.addControl(
        stat,
        new FormControl<number>(0, {
          updateOn: 'blur',
          validators: [
            Validators.required,
            Validators.max(stat === 'score' ? 99999 : 100),
            Validators.min(0),
            Validators.pattern('^[0-9]*$'),
          ],
        })
      );
    }
    (
      (this.formGroup.controls[this.formFields.statistics] as FormArray)
        .controls[teamIndex] as FormArray
    ).push(statFormGroup);
    this.playersDataSource[teamIndex].data.push({ id: 0, name: '' });
    this.tables?.get(teamIndex)?.renderRows();
  }

  removePlayerFromStats(teamIndex: number, index: number) {
    const statsFormArray = this.formGroup.controls[
      this.formFields.statistics
    ] as FormArray;
    (
      (statsFormArray.controls[teamIndex] as FormArray)
        .controls as FormGroup<any>[]
    ).splice(index, 1);
    this.playersDataSource[teamIndex].data.splice(index, 1);
    this.tables?.get(teamIndex)?.renderRows();
  }

  isPlayerAlreadySelectedByOther(
    teamIndex: number,
    index: number,
    playerId: number
  ) {
    return (this.formGroup.value[this.formFields.statistics] as any)?.[
      teamIndex
    ]?.find((e: any, i: number) => index !== i && e.player === playerId);
  }
}
