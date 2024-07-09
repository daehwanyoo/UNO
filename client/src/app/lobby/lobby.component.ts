import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LobbyStateService, Player } from '../services/lobby-state.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class LobbyComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription[] = [];

  public players: Player[] = [];
  public partyLeader: Player | null = null;
  public buttonActivated: boolean = false;
  public deepLinkUrl: string;
  public buttonActivated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _socket: SocketService,
    public lobbyState: LobbyStateService
  ) {
    this.deepLinkUrl = `${window.location.origin}/uno/lobby`;
  }

  ngOnInit(): void {
    this._initializeState();
    this._subscribeToSocketEvents();
    this._joinLobby();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._socket.emit('leaveLobby');
  }

  private _initializeState() {
    this._subscriptions.push(
      this.lobbyState.players$.subscribe(players => {
        this.players = players;
        console.log('Players updated:', players);
      }),
      this.lobbyState.partyLeader$.subscribe(leader => {
        this.partyLeader = leader;
      }),
      this.buttonActivated$.subscribe((activated: boolean) => {
        this.buttonActivated = activated;
      })
    );
  }

  private _subscribeToSocketEvents() {
    this._socket.on('updatePlayers', (players: Player[]) => {
      console.log('Received updatePlayers event with players:', players);
      this.players = players;
      this.lobbyState.players$.next(players);
    });

    this._socket.on('error', (message: string) => {
      console.error('Received error event with message:', message);
      alert(message);
    });
  }

  private _joinLobby() {
    console.log('Joining lobby');
    this._socket.emit('joinLobby', { displayName: 'Player ' + (this.players.length + 1) });
    console.log('Emitted joinLobby event');
  }

  public toggleReady() {
    this._socket.emit('readyUp');
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
