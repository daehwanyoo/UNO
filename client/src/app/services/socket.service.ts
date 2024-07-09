// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'  // Ensure the service is provided in the root injector
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');  // Initialize the socket connection
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
    this.emit('createGame', { displayName });
  }

  joinGame(roomCode: string, displayName: string) {
    this.emit('joinGame', { roomCode, displayName });
  }
}
