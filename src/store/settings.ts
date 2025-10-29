type SettingsState = {
  soundsDisabled: boolean;
};

type Listener = (state: SettingsState) => void;

class SettingsStore {
  private state: SettingsState = {
    soundsDisabled: false,
  };

  private listeners: Listener[] = [];

  getState(): SettingsState {
    return this.state;
  }

  setSoundsDisabled(disabled: boolean): void {
    this.state.soundsDisabled = disabled;
    this.notifyListeners();
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
