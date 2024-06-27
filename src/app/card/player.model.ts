export interface Player {
  id: number;
  name: string;
  cards: string[];
  isTurn: boolean;
  needsToClickUno?: boolean; // Last card calling Uno
  hasClickedUno?: boolean; // New flag to track if UNO has been clicked
}
