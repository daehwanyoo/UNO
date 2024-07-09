// src/app/landing-page/landing-page.component.ts
import { Component, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule, RouterModule],
})
export class LandingPageComponent implements AfterViewInit, OnInit {
  showRules = false;

  constructor(private elRef: ElementRef, private socketService: SocketService) {}

  ngOnInit() {
    // Listen for a test response from the server
    this.socketService.on('example-event-response', (data: any) => {
      console.log('Received example-event-response:', data);
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
}
