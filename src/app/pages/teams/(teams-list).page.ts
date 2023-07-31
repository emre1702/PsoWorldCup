import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ListTeam } from 'src/app/models/list-team';
import { TeamsService } from 'src/app/services/teams.service';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  providers: [TeamsService],
  imports: [CommonModule, RouterModule],
  template: ` <ng-container *ngIf="teams">
    <a [routerLink]="'/teams/' + team.id" *ngFor="let team of teams">{{
      team.name
    }}</a>
  </ng-container>`,
})
export default class TeamsListComponent {
  teams?: ListTeam[];

  constructor(private readonly teamsService: TeamsService) {
    this.teamsService.getTeams().subscribe((teams) => {
      this.teams = teams.sort((a, b) => a.name.localeCompare(b.name));
    });
  }
}
