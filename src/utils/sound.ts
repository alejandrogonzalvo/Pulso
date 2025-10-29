import clickSound from '../assets/sounds/click.mp3';
import startClickSound from '../assets/sounds/start-click.mp3';

export function playClickSound() {
  const audio = new Audio(clickSound);
  audio.volume = 0.5;
  audio.play().catch(err => console.error('Error playing click sound:', err));
}

export function playStartClickSound() {
  const audio = new Audio(startClickSound);
  audio.volume = 0.5;
  audio.play().catch(err => console.error('Error playing start click sound:', err));
}
