import { Injectable } from '@angular/core';
import { injectTRPCClient } from '../../trpc-client';
import { RouterInputs, RouterOutputs } from 'src/server/trpc/routers';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  private trpcClient = injectTRPCClient();

  createMatch(
    params: RouterInputs['matches']['create']
  ): Observable<RouterOutputs['matches']['create']> {
    return this.trpcClient.matches.create.mutate(params);
  }

  updateMatch(
    params: RouterInputs['matches']['update']
  ): Observable<RouterOutputs['matches']['update']> {
    return this.trpcClient.matches.update.mutate(params);
  }

  deleteMatch(
    params: RouterInputs['matches']['delete']
  ): Observable<RouterOutputs['matches']['delete']> {
    return this.trpcClient.matches.delete.mutate(params);
  }

  getMatches(
    params: RouterInputs['matches']['list']
  ): Observable<RouterOutputs['matches']['list']> {
    return this.trpcClient.matches.list.query(params);
  }

  getMatch(
    params: RouterInputs['matches']['detail']
  ): Observable<RouterOutputs['matches']['detail']> {
    return this.trpcClient.matches.detail.query(params);
  }
}
