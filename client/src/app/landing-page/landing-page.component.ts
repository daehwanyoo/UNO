import { Component, ElementRef, AfterViewInit } from '@angular/core';
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
export class LandingPageComponent implements AfterViewInit {
  showRules = false;

  constructor(private elRef: ElementRef) {}

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
