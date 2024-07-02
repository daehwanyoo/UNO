// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://local:3000'); 
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  emit(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
