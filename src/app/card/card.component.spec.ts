import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CardComponent {
  cardImages: string[] = [];
  gridSize: number = 2;
  selectedCards: string[] = [];
players: any;

  constructor() {
    this.loadCardImages();
  }

  loadCardImages() {
    for (let i = 1; i <= 60; i++) {
      this.cardImages.push(`assets/card${i}.png`);
    }
    this.shuffleAndSelectCards();
  }

  shuffleAndSelectCards() {
    const shuffledCards = [...this.cardImages];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    this.selectedCards = shuffledCards.slice(0, 32); // Select first 32 cards for grid sizes 2, 3, and 4
  }

  updateGridSize(size: number) {
    this.gridSize = size;
    this.shuffleAndSelectCards();
  }
}
