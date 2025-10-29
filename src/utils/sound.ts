import clickSound from '../assets/sounds/click.mp3';
import startClickSound from '../assets/sounds/start-click.mp3';
import { settingsStore } from '../store/settings';

export function playClickSound() {
  if (settingsStore.getState().soundsDisabled) return;

  const audio = new Audio(clickSound);
  audio.volume = 0.5;
  audio.play().catch(err => console.error('Error playing click sound:', err));
}

export function playStartClickSound() {
  if (settingsStore.getState().soundsDisabled) return;

  const audio = new Audio(startClickSound);
  audio.volume = 0.5;
  audio.play().catch(err => console.error('Error playing start click sound:', err));
}
