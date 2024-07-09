// src/app/lobby/lobby.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { LobbyStateService, Player } from '../services/lobby-state.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  private _allReadySubscription: Subscription = Subscription.EMPTY;
  private _navigationSubscription: Subscription = Subscription.EMPTY;
  private _roundStartSubscription: Subscription = Subscription.EMPTY;
  private _playersSubscription: Subscription = Subscription.EMPTY;
  private _partyLeaderSubscription: Subscription = Subscription.EMPTY;
  private _buttonActivatedSubscription: Subscription = Subscription.EMPTY;

  public players: Player[] = [];
  public partyLeader: Player | null = null;
  public buttonActivated: boolean = false;
  public deepLinkUrl: string;
  public buttonActivated$ = new BehaviorSubject<boolean>(false);
  public roomCode: string;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _socket: SocketService,
    public lobbyState: LobbyStateService
  ) {
    this.roomCode = this._route.snapshot.paramMap.get('roomCode')!;
    this.deepLinkUrl = `${window.location.origin}/lobby/${this.roomCode}`;
  }

  ngOnInit(): void {
    this._initializeState();
    this._navigateToGameOnStartRound();
    this._navigateToGameOnAllReady();
    this._leaveGameOnNavigationStart();

    this._playersSubscription = this.lobbyState.players$.subscribe(players => {
      this.players = players;
    });

    this._partyLeaderSubscription = this.lobbyState.partyLeader$.subscribe(leader => {
      this.partyLeader = leader;
    });

    this._buttonActivatedSubscription = this.buttonActivated$.subscribe((activated: boolean) => {
      this.buttonActivated = activated;
    });

    this._socket.on('updatePlayers', (players: Player[]) => {
      this.players = players;
    });

    this._socket.joinGame(this.roomCode, 'Player 1'); // Replace 'Player 1' with a user input
  }

  ngOnDestroy(): void {
    this._allReadySubscription.unsubscribe();
    this._navigationSubscription.unsubscribe();
    this._roundStartSubscription.unsubscribe();
    this._playersSubscription.unsubscribe();
    this._partyLeaderSubscription.unsubscribe();
    this._buttonActivatedSubscription.unsubscribe();
    this._socket.emit('leaveGame', this.roomCode);
  }

  private _navigateToGameOnStartRound() {
    this._roundStartSubscription = this._socket.on('startRound', () => {
      this._router.navigate(['/game'], { replaceUrl: true });
    }) as unknown as Subscription;
  }

  private _navigateToGameOnAllReady() {
    this._allReadySubscription = this._socket.on('allReady', () => {
      this._router.navigate(['/game'], { replaceUrl: true });
    }) as unknown as Subscription;
  }

  private _leaveGameOnNavigationStart() {
    this._navigationSubscription = this._router.events.subscribe((evt) => {
      if (
        evt instanceof NavigationStart &&
        evt.url !== '/game'
      ) {
        this._socket.emit('leaveGame', this.roomCode);
      }
    });
  }

  private _initializeState() {
    // Initialize state if needed
  }

  public toggleReady() {
    this._socket.emit('readyUp', this.roomCode);
  }

  public handleNameChanged(newName: string) {
    this._socket.emit('editPlayerName', { roomCode: this.roomCode, newName });
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
