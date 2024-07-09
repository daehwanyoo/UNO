import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Player } from './player.model';
import { parseCardFilename, isActionCard } from './card.utils';
import { Card } from './card.model';
import { ColorSelectionDialogComponent } from '../color-selection-dialog/color-selection-dialog.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ColorSelectionDialogComponent]
})
export class CardComponent implements OnInit {
  cardImages: string[] = [];
  gridSize: number = 4; // Fixed to 4 players
  players: Player[] = [];
  adminPlayer: Player = { id: 0, name: 'Admin', cards: [], isTurn: false };
  selectedCards: string[] = [];
  currentPlayerIndex: number = 0;
  drawPile: string[] = [];
  discardPile: string[] = [];
  selectedCard: string | null = null;
  cardBackImage: string = 'assets/card_back.png'; // Add the card back image path
  direction: number = 1; // 1 for forward, -1 for reverse
  showColorDialog: boolean = false;
  wildCardColor: string = '';
  showWinDialog: boolean = false;
  winnerName: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCardImages();
  }

  loadCardImages() {
    this.http.get<string[]>('assets/cards.json').subscribe(data => {
      this.cardImages = data;
      this.initializeGame();
    });
  }

  initializeGame() {
    this.showWinDialog = false; // Close win dialog if open
    this.initializePlayers();
    this.shuffleAndDistributeCards();
    this.setupDrawPile();
    this.drawInitialCard();
    this.logCardDetails();
  }

  initializePlayers() {
    this.players = [
      { id: 1, name: 'Player 1', cards: [], isTurn: false },
      { id: 2, name: 'Player 2', cards: [], isTurn: false },
      { id: 3, name: 'Player 3', cards: [], isTurn: false },
      { id: 4, name: 'Player 4', cards: [], isTurn: false },
    ];
    this.players[this.currentPlayerIndex].isTurn = true;
  }

  shuffleAndDistributeCards() {
    const shuffledCards = [...this.cardImages];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); 
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    let cardIndex = 0;
    const cardsPerPlayer = 8;

    this.players.forEach(player => {
      player.cards = shuffledCards.slice(cardIndex, cardIndex + cardsPerPlayer);
      cardIndex += cardsPerPlayer;
    });

    this.selectedCards = shuffledCards.slice(0, this.players.length * cardsPerPlayer); // Ensure the selectedCards array is set properly

    this.direction = 1; // Reset the direction to forward
  }

  setupDrawPile() {
    const allDistributedCards = this.players.flatMap(player => player.cards);
    this.drawPile = this.cardImages.filter(card => !allDistributedCards.includes(card));
    this.discardPile = []; // Initialize discard pile
  }

  drawInitialCard() {
    // Draw a single card from the draw pile and place it in the discard pile
    while (this.drawPile.length > 0) {
      const initialCard = this.drawPile.pop()!;
      const cardDetails = parseCardFilename(initialCard);
      if (!isActionCard(cardDetails)) {
        this.discardPile.push(initialCard);
        this.adminPlayer.cards.push(initialCard); // Ensure the admin player has the initial card
        break;
      }
    }
  }

  logCardDetails() {
    this.players.forEach(player => {
      console.log(`${player.name}: ${player.cards.join(', ')}`);
    });

    const remainingCards = this.cardImages.filter(card => !this.selectedCards.includes(card));
    console.log(`Remaining cards: ${remainingCards.join(', ')}`);
  }

  selectCard(card: string) {
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.cards.includes(card) && this.isValidPlay(card, this.discardPile[this.discardPile.length - 1])) {
      console.log(`Card selected: ${card} by player: ${currentPlayer.name}`);
      this.selectedCard = card;
      this.moveCardToDiscardPile(card);
    }
  }

  moveCardToDiscardPile(card: string) {
    const currentPlayer = this.players[this.currentPlayerIndex];
    currentPlayer.cards = currentPlayer.cards.filter(c => c !== card);
    this.adminPlayer.cards.push(card);
    this.discardPile.push(card);
    console.log(`Moved card to discard pile: ${card}`);
    this.checkWinCondition(currentPlayer);
    this.selectedCard = null; // Reset the selected card after moving it to the discard pile
    this.playCard(card, currentPlayer); // Ensure the playCard logic is invoked
  }
  checkWinCondition(player: Player) {
    if (player.cards.length === 0) {
      console.log(`${player.name} wins!`);
      this.showWinningScreen(player.name);
    }
  }

  showWinningScreen(winner: string) {
    this.winnerName = winner;
    this.showWinDialog = true;
    console.log(`Showing winning screen for ${winner}`);
  }

  playCard(card: string, player: Player) {
    const topCard = this.discardPile[this.discardPile.length - 1];
    console.log(`Top card before play: ${topCard}`);
    console.log(`Attempting to play card: ${card} by player: ${player.name}`);
    if (player.isTurn && this.isValidPlay(card, topCard)) {
      console.log(`Playing card: ${card} by player: ${player.name}`);
      this.discardPile.push(card);
      player.cards = player.cards.filter(c => c !== card);
      this.handleSpecialCard(card);
      this.checkWinCondition(player);
      if (!this.isSpecialCard(card)) {
        if (player.cards.length === 1) {
          player.needsToClickUno = true; // Set the flag when the player has one card left
        } else {
          this.nextTurn();
        }
      }
    }
  }

  handleSpecialCard(card: string) {
    const cardDetails = parseCardFilename(card);
    console.log(`Handling special card: ${cardDetails.value} (${card})`);
    switch (cardDetails.value) {
      case 'skip': // Skip
        this.skipNextPlayer();
        break;
      case 'reverse': // Reverse
        this.reversePlayOrder();
        this.nextTurn(); // Immediately go to the next player after reversing
        break;
      case 'draw two': // Draw Two
        this.drawCardsForNextPlayer(2);
        this.skipNextPlayer(); // The next player forfeits their turn
        break;
      case 'wild': // Wild
        console.log("Wild card played, showing color dialog");
        this.showColorDialog = true;
        break;
      case 'wilddraw4': // Wild Draw Four
        console.log("Wild Draw Four card played, showing color dialog");
        this.showColorDialog = true;
        break;
    }
  }

  nextTurn() {
    // Ensure no player has isTurn set to true before moving to the next turn
    this.players.forEach(player => player.isTurn = false);

    // Move to the next player, taking into account the current direction
    this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;

    // Set isTurn for the new current player
    this.players[this.currentPlayerIndex].isTurn = true;
    console.log(`Next turn: ${this.players[this.currentPlayerIndex].name} (Index: ${this.currentPlayerIndex}, Direction: ${this.direction})`);
  }

  resetGame() {
    this.currentPlayerIndex = 0;
    this.showWinDialog = false; // Close win dialog if open
    this.initializeGame();
  }

  isValidPlay(card: string, topCard: string): boolean {
    const cardDetails = parseCardFilename(card);
    const topCardDetails = parseCardFilename(topCard);

    console.log(`Checking if card ${card} (Color: ${cardDetails.color}, Value: ${cardDetails.value}) is valid on top card ${topCard} (Color: ${topCardDetails.color}, Value: ${topCardDetails.color})`);

    // Check if the card matches the top card's color, value, or is a wild card
    const isValid = (
      cardDetails.color === topCardDetails.color ||
      cardDetails.value === topCardDetails.value ||
      cardDetails.color === 'wild' ||
      (topCardDetails.color === 'wild' && this.wildCardColor === cardDetails.color) // Check if the top card was a wild card and the chosen color matches
    );

    console.log(`Is valid play: ${isValid}`);
    return isValid;
  }

  skipNextPlayer() {
    // Reset the isTurn flag for the current player
    this.players[this.currentPlayerIndex].isTurn = false;

    // Move to the next player, taking into account the current direction
    this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    console.log(`Skipping player: ${this.players[this.currentPlayerIndex].name}`);

    // Move to the player after the skipped one
    this.nextTurn();
  }

  reversePlayOrder() {
    // Reverse the direction
    this.direction *= -1;
    console.log(`Direction reversed: ${this.direction}`);
  }

  drawCardsForNextPlayer(count: number) {
    const nextPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    const nextPlayer = this.players[nextPlayerIndex];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length > 0) {
        const drawnCard = this.drawPile.pop()!;
        nextPlayer.cards.push(drawnCard);
        console.log(`Player ${nextPlayer.name} drew a card: ${drawnCard}`);
      } else {
        console.log('Draw pile is empty. Replenishing from discard pile.');
        this.replenishDrawPile();
        if (this.drawPile.length > 0) {
          const drawnCard = this.drawPile.pop()!;
          nextPlayer.cards.push(drawnCard);
          console.log(`Player ${nextPlayer.name} drew a card: ${drawnCard}`);
        } else {
          console.log('No cards left to draw, even after replenishing from discard pile.');
          break;
        }
      }
    }
  }

  chooseColor(color: string) {
    console.log(`Color chosen: ${color}`);
    this.showColorDialog = false;
    this.wildCardColor = color;

    // Update the top card in the discard pile to reflect the chosen color
    const topCard = this.discardPile[this.discardPile.length - 1];
    const topCardDetails = parseCardFilename(topCard);
    if (topCardDetails.color === 'wild') {
      const newTopCard = `assets/card_${color[0]}w.png`; // Example: 'assets/card_rw.png' for red wild
      this.discardPile[this.discardPile.length - 1] = newTopCard;
      console.log(`Updated top card in discard pile to: ${newTopCard}`);
    }

    if (topCardDetails.value === 'wilddraw4') {
      this.drawCardsForNextPlayer(4);
      this.skipNextPlayer(); // The next player forfeits their turn
    } else {
      this.nextTurn(); // Continue the game after color is chosen
    }
  }

  isSpecialCard(card: string): boolean {
    return ['skip', 'reverse', 'draw two', 'wild', 'wilddraw4'].includes(parseCardFilename(card).value);
  }

  replenishDrawPile() {
    if (this.discardPile.length > 1) {
      const lastCard = this.discardPile.pop()!; // Keep the top card on the discard pile
      const shuffledDiscardPile = this.discardPile.sort(() => Math.random() - 0.5); // Shuffle the discard pile
      this.drawPile = shuffledDiscardPile;
      this.discardPile = [lastCard]; // Reset the discard pile with the top card
      console.log('Replenished draw pile from discard pile.');
    }
  }

  drawCard(player: Player) {
    if (this.drawPile.length === 0) {
      this.replenishDrawPile();
    }

    if (this.drawPile.length > 0) {
      const drawnCard = this.drawPile.pop()!;
      player.cards.push(drawnCard);
      console.log(`Player ${player.name} drew a card: ${drawnCard}`);
      this.nextTurn(); // Move to the next player's turn after drawing a card
    } else {
      console.log('No cards left to draw, even after replenishing from discard pile.');
    }
  }

  confirmUno(player: Player) {
    if (player.needsToClickUno) {
      player.needsToClickUno = false; // Clear the flag
      player.hasClickedUno = true; // Mark UNO as clicked
      this.nextTurn(); // Proceed to the next player's turn
    }
  }

}
