import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'  // Ensure the service is provided in the root injector
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');  // Initialize the socket connection

    this.socket.on('connect', () => {
      console.log('Socket connected with ID:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
    return {
      unsubscribe: () => this.socket.off(event, callback)
    };
  }

  emit(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }

  disconnect() {
    this.socket.disconnect();
  }

  get socketId() {
    return this.socket.id;
  }

  createGame(displayName: string) {
    console.log('Creating game with display name:', displayName);
    this.emit('createGame', { displayName });
  }

  joinLobby(displayName: string) {
    console.log('Joining lobby with display name:', displayName);
    this.emit('joinLobby', { displayName });
  }
}
