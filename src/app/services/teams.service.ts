import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListTeam } from '../models/list-team';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TeamsService {
  constructor(private readonly httpClient: HttpClient) {}

  getTeams(): Observable<ListTeam[]> {
    return this.httpClient.get<ListTeam[]>('/api/teams');
  }
}
