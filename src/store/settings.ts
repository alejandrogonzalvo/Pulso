import { updateSettings as updateDbSettings } from '../services/database';

export type SettingsState = {
  soundsDisabled: boolean;
  focusTime: number; // in minutes
  shortBreakTime: number; // in minutes
  longBreakTime: number; // in minutes
  intervalsBeforeLongBreak: number;
  maxCycles: number; // 0 for endless
};

type Listener = (state: SettingsState) => void;

class SettingsStore {
  private state: SettingsState = {
    soundsDisabled: false,
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    intervalsBeforeLongBreak: 4,
    maxCycles: 0,
  };

  private listeners: Listener[] = [];

  getState(): SettingsState {
    return this.state;
  }

  setSoundsDisabled(disabled: boolean): void {
    this.state.soundsDisabled = disabled;
    this.notifyListeners();
  }

  setFocusTime(minutes: number): void {
    this.state.focusTime = minutes;
    this.notifyListeners();
    this.persistToDatabase();
  }

  setShortBreakTime(minutes: number): void {
    this.state.shortBreakTime = minutes;
    this.notifyListeners();
    this.persistToDatabase();
  }

  setLongBreakTime(minutes: number): void {
    this.state.longBreakTime = minutes;
    this.notifyListeners();
    this.persistToDatabase();
  }

  setIntervalsBeforeLongBreak(intervals: number): void {
    this.state.intervalsBeforeLongBreak = intervals;
    this.notifyListeners();
    this.persistToDatabase();
  }

  setMaxCycles(cycles: number): void {
    this.state.maxCycles = cycles;
    this.notifyListeners();
    this.persistToDatabase();
  }

  updateSettings(partial: Partial<SettingsState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
    this.persistToDatabase();
  }

  private async persistToDatabase(): Promise<void> {
    await updateDbSettings({
      work_duration: this.state.focusTime,
      short_break_duration: this.state.shortBreakTime,
      long_break_duration: this.state.longBreakTime,
      pomodoros_until_long_break: this.state.intervalsBeforeLongBreak,
      max_cycles: this.state.maxCycles,
    });
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const settingsStore = new SettingsStore();
