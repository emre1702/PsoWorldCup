import { Component, Input, inject, importProvidersFrom } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { getInputWithAuth, injectTRPCClient } from '../../../trpc-client';
import {
  IDropdownSettings,
  NgMultiSelectDropDownModule,
} from 'ng-multiselect-dropdown';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
  providers: [importProvidersFrom(NgMultiSelectDropDownModule.forRoot())],
};

@Component({
  selector: 'app-users-update',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgMultiSelectDropDownModule,
    MatProgressSpinnerModule,
  ],
  template: ` <mat-spinner *ngIf="loading"></mat-spinner>
    <form
      [formGroup]="formGroup"
      (ngSubmit)="updateUser()"
      class="flex flex-col gap-4"
      *ngIf="!loading"
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
          Name must be at least 1 characters long
        </mat-error>
        <mat-error
          *ngIf="formGroup.get(formFields.name)?.hasError('maxlength')"
        >
          Name cannot be more than 200 characters long
        </mat-error>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Discord ID</mat-label>
        <input matInput [formControlName]="formFields.discordId" />
        <mat-error
          *ngIf="formGroup.get(formFields.discordId)?.hasError('required')"
        >
          Discord ID is required
        </mat-error>
        <mat-error
          *ngIf="formGroup.get(formFields.discordId)?.hasError('minlength')"
        >
          Discord ID must be at least 3 characters long
        </mat-error>
        <mat-error
          *ngIf="formGroup.get(formFields.discordId)?.hasError('maxlength')"
        >
          Discord ID cannot be more than 200 characters long
        </mat-error>
      </mat-form-field>

      <ng-multiselect-dropdown
        [placeholder]="'Select permissions'"
        [data]="permissions"
        [formControlName]="formFields.permissions"
        [settings]="permissionsDropdownSettings"
      ></ng-multiselect-dropdown>

      <button
        mat-raised-button
        color="primary"
        type="submit"
        [disabled]="!formGroup.valid"
      >
        Update User
      </button>
    </form>`,
})
export default class UserUpdateComponent {
  @Input({ required: true }) userId!: string;

  readonly formFields = {
    name: 'name',
    discordId: 'discordId',
    permissions: 'permissions',
  };
  readonly formGroup = new FormGroup({
    [this.formFields.name]: new FormControl('', {
      updateOn: 'blur',
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200),
      ],
    }),
    [this.formFields.discordId]: new FormControl('', {
      updateOn: 'blur',
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
      ],
    }),
    [this.formFields.permissions]: new FormControl<string[]>([], {
      updateOn: 'blur',
    }),
  });
  permissionsDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    allowSearchFilter: true,
    enableCheckAll: true,
  };
  permissions: string[] = [];
  loading = true;

  private readonly trpcClient = injectTRPCClient();
  private readonly router = inject(Router);

  ngOnInit() {
    this.trpcClient.users.detail
      .query(getInputWithAuth(Number(this.userId)))
      .subscribe((user) => {
        if (!user) {
          this.router.navigate(['/users']);
          return;
        }
        this.formGroup.patchValue({
          [this.formFields.name]: user.name,
          [this.formFields.discordId]: user.discordId,
          [this.formFields.permissions]: user.permissions,
        });
        this.loading = false;
      });

    this.trpcClient.permissions.listNames
      .query()
      .subscribe((permissions) => (this.permissions = permissions));
  }

  updateUser() {
    const userIdNumber = Number(this.userId);
    const value = this.formGroup.value;
    this.trpcClient.users.update
      .mutate(
        getInputWithAuth({
          id: userIdNumber,
          name: value[this.formFields.name] as string,
          discordId: value[this.formFields.discordId] as string,
          permissions: value[this.formFields.permissions] as string[],
        })
      )
      .subscribe(() => this.router.navigate(['/users']));
  }
}
