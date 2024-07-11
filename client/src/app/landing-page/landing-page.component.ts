import { Component, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule, RouterModule], // Use RouterModule instead of Router
})
export class LandingPageComponent implements AfterViewInit, OnInit {
  showRules = false;

  constructor(private elRef: ElementRef, private socketService: SocketService, private router: Router) {}

  ngOnInit() {
    // Listen for a test response from the server
    this.socketService.on('example-event-response', (data: any) => {
      console.log('Received example-event-response:', data);
    });
    this.socketService.on('connect', () => {
      console.log('Socket connected');
    });
  }

  ngAfterViewInit() {
    const images = this.elRef.nativeElement.querySelectorAll('.falling-image');
    images.forEach((image: HTMLElement) => {
      const randomStart = Math.floor(Math.random() * 200) - 100; // Random value between -100 and 100
      image.style.transform = `translateY(${randomStart}vh)`;
    });
  }

  toggleRules() {
    this.showRules = !this.showRules;
  }

  createGame() {
    const displayName = 'Player 1';
    localStorage.setItem('displayName', displayName);
    this.socketService.createGame(displayName);

    const checkSocketId = () => {
      if (this.socketService.socketId) {
        this.router.navigate(['/uno/lobby']);
      } else {
        setTimeout(checkSocketId, 100); // Retry after 100ms
      }
    };
    checkSocketId();
  }
}
