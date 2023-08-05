import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { injectTRPCClient } from '../trpc-client';
import { RouterInputs, RouterOutputs } from 'src/server/trpc/routers';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private trpcClient = injectTRPCClient();

  getTeams(
    params: RouterInputs['teams']['list']
  ): Observable<RouterOutputs['teams']['list']> {
    return this.trpcClient.teams.list.query(params);
  }

  getDetail(
    params: RouterInputs['teams']['detail']
  ): Observable<RouterOutputs['teams']['detail']> {
    return this.trpcClient.teams.detail.query(params);
  }

  createTeam(
    params: RouterInputs['teams']['create']
  ): Observable<RouterOutputs['teams']['create']> {
    return this.trpcClient.teams.create.mutate(params);
  }

  updateTeam(
    params: RouterInputs['teams']['update']
  ): Observable<RouterOutputs['teams']['update']> {
    return this.trpcClient.teams.update.mutate(params);
  }

  deleteTeam(
    params: RouterInputs['teams']['delete']
  ): Observable<RouterOutputs['teams']['delete']> {
    return this.trpcClient.teams.delete.mutate(params);
  }
}
