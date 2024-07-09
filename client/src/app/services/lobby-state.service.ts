// src/app/services/lobby-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Player {
  playerId: string;
  displayName: string;
  isReady: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LobbyStateService {
  public players$ = new BehaviorSubject<Player[]>([]);
  public partyLeader$ = new BehaviorSubject<Player | null>(null);
  public roomCode$ = new BehaviorSubject<string>('');

  constructor() {}
}
