import { Card } from './card.model';

export function parseCardFilename(filename: string): Card {
  const parts = filename.split('/');
  const namePart = parts[parts.length - 1].replace('card_', '').replace('.png', '');

  let color = '';
  let value = '';
  let action = '';

  if (namePart.startsWith('r')) {
    color = 'red';
  } else if (namePart.startsWith('g')) {
    color = 'green';
  } else if (namePart.startsWith('b')) {
    color = 'blue';
  } else if (namePart.startsWith('y')) {
    color = 'yellow';
  } else if (namePart === 'w') {
    color = 'wild';
    value = 'wild';
    action = 'wild';
  } else if (namePart === 'w4') {
    color = 'wild';
    value = 'wilddraw4';
    action = 'wilddraw4';
  }

  if (color !== 'wild') {
    const rest = namePart.substring(1);
    if (rest.startsWith('d2')) {
      value = 'draw two';
      action = 'draw two';
    } 
    else if (rest.startsWith('s')) {
      value = 'skip';
      action = 'skip';
    } else if (rest.startsWith('r')) {
      value = 'reverse';
      action = 'reverse';
    } else {
      value = rest; // Assume the rest is the number value
    }
  }

  console.log(`Parsed card - Color: ${color}, Value: ${value}, Action: ${action}`);
  return { color, value, action, imageUrl: filename };
}

export function isActionCard(card: Card): boolean {
  return ['skip', 'reverse', 'draw two', 'wild', 'wilddraw4'].includes(card.value);
}
