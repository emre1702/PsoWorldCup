import { Injectable } from '@angular/core';
import { injectTRPCClient } from '../../trpc-client';
import { RouterInputs, RouterOutputs } from 'src/server/trpc/routers';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private trpcClient = injectTRPCClient();

  getPlayersWithoutTeam(
    params: RouterInputs['players']['listWithoutTeam']
  ): Observable<RouterOutputs['players']['listWithoutTeam']> {
    return this.trpcClient.players.listWithoutTeam.query(params);
  }

  createPlayer(
    params: RouterInputs['players']['create']
  ): Observable<RouterOutputs['players']['create']> {
    return this.trpcClient.players.create.mutate(params);
  }

  deletePlayer(
    params: RouterInputs['players']['delete']
  ): Observable<RouterOutputs['players']['delete']> {
    return this.trpcClient.players.delete.mutate(params);
  }

  updatePlayer(
    params: RouterInputs['players']['update']
  ): Observable<RouterOutputs['players']['update']> {
    return this.trpcClient.players.update.mutate(params);
  }

  getPlayer(
    params: RouterInputs['players']['detail']
  ): Observable<RouterOutputs['players']['detail']> {
    return this.trpcClient.players.detail.query(params);
  }

  getPlayers(
    params: RouterInputs['players']['listAll']
  ): Observable<RouterOutputs['players']['listAll']> {
    return this.trpcClient.players.listAll.query(params);
  }
}
