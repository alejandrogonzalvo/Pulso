import { TimerState, SessionType, Settings, TimerContext } from '../types';
import { createSession, updateSession, getSettings, checkAchievements } from './database';
import { settingsStore } from '../store/settings';

export class TimerService {
  private state: TimerState = TimerState.IDLE;
  private timeRemaining: number = 0; // in seconds
  private intervalId: number | null = null;
  private currentSessionId: number | null = null;
  private sessionCount: number = 0;
  private settings: Settings | null = null;
  private listeners: Set<(context: TimerContext) => void> = new Set();
  private stateBeforePause: TimerState | null = null; // Track state before pausing

  constructor() {
    this.loadSettings();

    // Subscribe to settings changes
    settingsStore.subscribe(() => {
      this.updateTimerFromSettings();
    });
  }

  private updateTimerFromSettings() {
    const storeSettings = settingsStore.getState();

    // Update the settings object with new values
    if (this.settings) {
      this.settings.work_duration = storeSettings.focusTime;
      this.settings.short_break_duration = storeSettings.shortBreakTime;
      this.settings.long_break_duration = storeSettings.longBreakTime;
      this.settings.pomodoros_until_long_break = storeSettings.intervalsBeforeLongBreak;
    }

    // If idle, update the time remaining to reflect new work duration
    if (this.state === TimerState.IDLE) {
      this.timeRemaining = storeSettings.focusTime * 60;
      this.notifyListeners();
    }
  }

  async loadSettings() {
    this.settings = await getSettings();
    const storeSettings = settingsStore.getState();

    // Initialize settings from store
    this.settings.work_duration = storeSettings.focusTime;
    this.settings.short_break_duration = storeSettings.shortBreakTime;
    this.settings.long_break_duration = storeSettings.longBreakTime;
    this.settings.pomodoros_until_long_break = storeSettings.intervalsBeforeLongBreak;

    if (this.state === TimerState.IDLE) {
      this.timeRemaining = this.settings.work_duration * 60;
    }
    this.notifyListeners();
  }

  subscribe(listener: (context: TimerContext) => void) {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.getContext());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const context = this.getContext();
    this.listeners.forEach(listener => listener(context));
  }

  getContext(): TimerContext {
    return {
      state: this.state,
      timeRemaining: this.timeRemaining,
      currentSession: this.sessionCount,
      settings: this.settings || this.getDefaultSettings(),
    };
  }

  private getDefaultSettings(): Settings {
    return {
      work_duration: 25,
      short_break_duration: 5,
      long_break_duration: 15,
      pomodoros_until_long_break: 4,
      auto_start_breaks: false,
      auto_start_work: false,
      notification_sound: true,
      notification_volume: 50,
      youtube_playlists: [],
    };
  }

  async start() {
    if (!this.settings) {
      await this.loadSettings();
    }

    if (this.state === TimerState.IDLE) {
      // Starting a new work session
      this.state = TimerState.WORK;
      this.timeRemaining = this.settings!.work_duration * 60;
      this.sessionCount++;

      // Create session in database
      this.currentSessionId = await createSession({
        timestamp: Date.now(),
        duration: this.settings!.work_duration * 60,
        type: SessionType.WORK,
        completed: false,
      });
    } else if (this.state === TimerState.PAUSED) {
      // Resume from pause
      this.state = this.getPreviousState();
    }

    this.startTimer();
    this.notifyListeners();
  }

  pause() {
    if (this.state === TimerState.WORK || this.state === TimerState.SHORT_BREAK || this.state === TimerState.LONG_BREAK) {
      this.stopTimer();
      this.stateBeforePause = this.state; // Save the current state
      this.state = TimerState.PAUSED;
      this.notifyListeners();
    }
  }

  async stop() {
    this.stopTimer();

    if (this.currentSessionId !== null) {
      await updateSession(this.currentSessionId, false);
      this.currentSessionId = null;
    }

    this.state = TimerState.IDLE;
    this.stateBeforePause = null;
    this.timeRemaining = this.settings?.work_duration ? this.settings.work_duration * 60 : 25 * 60;
    this.sessionCount = 0;
    this.notifyListeners();
  }

  async skip() {
    await this.completeCurrentSession();
    this.stopTimer();
    await this.transitionToNextState();
    this.startTimer();
    this.notifyListeners();
  }

  private startTimer() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      this.timeRemaining--;

      if (this.timeRemaining <= 0) {
        this.onTimerComplete();
      }

      this.notifyListeners();
    }, 1000);
  }

  private stopTimer() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async onTimerComplete() {
    this.stopTimer();
    await this.completeCurrentSession();

    // Play notification sound if enabled
    if (this.settings?.notification_sound) {
      this.playNotificationSound();
    }

    // Check for newly unlocked achievements
    const newAchievements = await checkAchievements();
    if (newAchievements.length > 0) {
      this.showAchievementNotification(newAchievements);
    }

    this.transitionToNextState();
  }

  private async completeCurrentSession() {
    if (this.currentSessionId !== null) {
      await updateSession(this.currentSessionId, true);
      this.currentSessionId = null;
    }
  }

  private async transitionToNextState() {
    if (!this.settings) {
      await this.loadSettings();
    }

    const settings = this.settings!;

    if (this.state === TimerState.WORK) {
      // After work, decide between short or long break
      if (this.sessionCount % settings.pomodoros_until_long_break === 0) {
        this.state = TimerState.LONG_BREAK;
        this.timeRemaining = settings.long_break_duration * 60;

        this.currentSessionId = await createSession({
          timestamp: Date.now(),
          duration: settings.long_break_duration * 60,
          type: SessionType.LONG_BREAK,
          completed: false,
        });
      } else {
        this.state = TimerState.SHORT_BREAK;
        this.timeRemaining = settings.short_break_duration * 60;

        this.currentSessionId = await createSession({
          timestamp: Date.now(),
          duration: settings.short_break_duration * 60,
          type: SessionType.SHORT_BREAK,
          completed: false,
        });
      }

      // Auto-start break if enabled
      if (settings.auto_start_breaks) {
        this.startTimer();
      }
    } else if (this.state === TimerState.SHORT_BREAK || this.state === TimerState.LONG_BREAK) {
      // After break, go back to work
      this.state = TimerState.WORK;
      this.timeRemaining = settings.work_duration * 60;
      this.sessionCount++;

      this.currentSessionId = await createSession({
        timestamp: Date.now(),
        duration: settings.work_duration * 60,
        type: SessionType.WORK,
        completed: false,
      });

      // Auto-start work if enabled
      if (settings.auto_start_work) {
        this.startTimer();
      }
    }

    this.notifyListeners();
  }

  private getPreviousState(): TimerState {
    return this.stateBeforePause || TimerState.WORK;
  }

  private playNotificationSound() {
    // Play a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    const volume = (this.settings?.notification_volume || 50) / 100;
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  private showAchievementNotification(achievements: any[]) {
    // This will be handled by the UI layer
    // Emit custom event
    window.dispatchEvent(new CustomEvent('achievements-unlocked', {
      detail: achievements
    }));
  }
}

// Export singleton instance
export const timerService = new TimerService();
