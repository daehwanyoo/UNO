import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LobbyStateService, Player } from '../services/lobby-state.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class LobbyComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription[] = [];
  private socketId: string = '';

  public players: Player[] = [];
  public partyLeader: Player | null = null;
  public currentPlayer: Player | null = null;
  public buttonActivated: boolean = false;
  public deepLinkUrl: string;
  public buttonActivated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _socket: SocketService,
    public lobbyState: LobbyStateService,
    private router: Router
  ) {
    this.deepLinkUrl = `${window.location.origin}/uno/lobby`;
  }

  ngOnInit(): void {
    console.log('LobbyComponent ngOnInit');
    this._subscribeToSocketEvents();

    this._socket.on('connect', () => {
      this.socketId = this._socket.socketId || '';
      console.log('Socket connected with ID:', this.socketId);
      const displayName = localStorage.getItem('displayName') || 'Player';
      this._joinLobby(displayName);
    });

    if (this._socket.socketId) {
      this.socketId = this._socket.socketId;
      const displayName = localStorage.getItem('displayName') || 'Player';
      this._joinLobby(displayName);
    }
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._socket.emit('leaveLobby');
  }

  private _initializeState(players: Player[]) {
    this.players = players;
    this.partyLeader = players[0] || null;
    this.currentPlayer = players.find(player => player.playerId === this.socketId) || null;
    this.buttonActivated = players.every(player => player.isReady);
    console.log('Players updated:', players);
    console.log('Party Leader:', this.partyLeader);
    console.log('Current Player:', this.currentPlayer);
    console.log('Socket ID:', this.socketId);
  }

  private _subscribeToSocketEvents() {
    this._socket.on('updatePlayers', (players: Player[]) => {
      console.log('Received updatePlayers event with players:', players);
      this._initializeState(players);
      this.lobbyState.players$.next(players);
    });

    this._socket.on('allReady', () => {
      this.buttonActivated = true;
    });

    this._socket.on('gameStarted', () => {
      console.log('Game started!');
      this.router.navigate(['/uno/card']);  // Navigate to CardComponent when the game starts
    });

    this._socket.on('error', (message: string) => {
      console.error('Received error event with message:', message);
      alert(message);
    });
  }

  private _joinLobby(displayName: string) {
    console.log('Joining lobby with name:', displayName);
    this._socket.joinLobby(displayName);
    console.log('Emitted joinLobby event');
  }

  public toggleReady() {
    this._socket.emit('readyUp');
  }

  public startGame() {
    if (this.partyLeader?.playerId === this.currentPlayer?.playerId && this.buttonActivated) {
      this._socket.emit('startGame');
    }
  }

  public handleNameChanged(newName: string) {
    this._socket.emit('editPlayerName', newName);
  }

  public copyGameCode() {
    const input = document.createElement('input');
    input.value = this.deepLinkUrl;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert('Game code copied to clipboard!');
  }
}
