import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  // Import Router and RouterModule
import { LobbyStateService, Player } from '../services/lobby-state.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]  // Include RouterModule in the imports
})
export class LobbyComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription[] = [];
  private socketId: string = '';  // Initialize socketId with an empty string

  public players: Player[] = [];
  public partyLeader: Player | null = null;
  public currentPlayer: Player | null = null;  // Track the current player
  public buttonActivated: boolean = false;
  public deepLinkUrl: string;
  public buttonActivated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _socket: SocketService,
    public lobbyState: LobbyStateService,
    private router: Router  // Inject Router
  ) {
    this.deepLinkUrl = `${window.location.origin}/uno/lobby`;
  }

  ngOnInit(): void {
    this._subscribeToSocketEvents();  // Subscribe to socket events first
    // this._joinLobby(); // Moved to connect event
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._socket.emit('leaveLobby');
  }

  private _initializeState(players: Player[]) {
    this.players = players;
    this.partyLeader = players.find(player => player.displayName === 'Player 1') || null;
    this.currentPlayer = players.find(player => player.playerId === this.socketId) || null;
    console.log('Players updated:', players);
    console.log('Party Leader:', this.partyLeader);
    console.log('Current Player:', this.currentPlayer);
    console.log('Socket ID:', this.socketId);
  }

  private _subscribeToSocketEvents() {
    this._socket.on('connect', () => {
      this.socketId = this._socket.socketId || '';  // Set the socket ID once the connection is established
      console.log('Socket connected with ID:', this.socketId);
      this._joinLobby();  // Join the lobby once the socket ID is available
    });

    this._socket.on('updatePlayers', (players: Player[]) => {
      console.log('Received updatePlayers event with players:', players);
      this._initializeState(players);  // Initialize state with the received players
      this.lobbyState.players$.next(players);
    });

    this._socket.on('allReady', () => {
      this.buttonActivated$.next(true);
    });

    this._socket.on('gameStarted', () => {
      console.log('Game started!');
      this.router.navigate(['/card']);  // Navigate to CardComponent when the game starts
    });

    this._socket.on('error', (message: string) => {
      console.error('Received error event with message:', message);
      alert(message);
    });
  }

  private _joinLobby() {
    console.log('Joining lobby');
    this._socket.emit('joinLobby');
    console.log('Emitted joinLobby event');
  }

  public toggleReady() {
    this._socket.emit('readyUp');
  }

  public startGame() {
    this._socket.emit('startGame');
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
