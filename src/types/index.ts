export enum TimerState {
  IDLE = 'IDLE',
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
  PAUSED = 'PAUSED',
}

export enum SessionType {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface Session {
  id?: number;
  timestamp: number;
  duration: number;
  type: SessionType;
  completed: boolean;
  created_at?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlock_criteria: UnlockCriteria;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface UnlockCriteria {
  type: 'sessions_completed' | 'streak_days' | 'total_hours' | 'first_session';
  value: number;
}

export interface Statistics {
  total_sessions: number;
  total_work_time: number; // in seconds
  total_break_time: number;
  current_streak: number;
  longest_streak: number;
  sessions_today: number;
  sessions_this_week: number;
  sessions_this_month: number;
}

export interface Settings {
  work_duration: number; // in minutes
  short_break_duration: number;
  long_break_duration: number;
  pomodoros_until_long_break: number;
  max_cycles: number; // 0 for endless, otherwise number of work sessions before stopping
  show_title_bar: boolean;
  auto_start_breaks: boolean;
  auto_start_work: boolean;
  notification_sound: boolean;
  notification_volume: number;
  youtube_playlists: string[];
  show_motivational_quotes: boolean;
}

export interface TimerContext {
  state: TimerState;
  timeRemaining: number; // in seconds
  currentSession: number; // current pomodoro count
  settings: Settings;
}
