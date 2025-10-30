import Database from '@tauri-apps/plugin-sql';
import { Session, Achievement, Settings, Statistics } from '../types';

let db: Database | null = null;

// SQL migrations embedded directly
const migration_001 = `
-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('WORK', 'SHORT_BREAK', 'LONG_BREAK')),
    completed BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    unlock_criteria_type TEXT NOT NULL,
    unlock_criteria_value INTEGER NOT NULL,
    unlocked BOOLEAN NOT NULL DEFAULT 0,
    unlocked_at DATETIME
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    work_duration INTEGER NOT NULL DEFAULT 25,
    short_break_duration INTEGER NOT NULL DEFAULT 5,
    long_break_duration INTEGER NOT NULL DEFAULT 15,
    pomodoros_until_long_break INTEGER NOT NULL DEFAULT 4,
    max_cycles INTEGER NOT NULL DEFAULT 0,
    show_title_bar BOOLEAN NOT NULL DEFAULT 1,
    auto_start_breaks BOOLEAN NOT NULL DEFAULT 0,
    auto_start_work BOOLEAN NOT NULL DEFAULT 0,
    notification_sound BOOLEAN NOT NULL DEFAULT 1,
    notification_volume INTEGER NOT NULL DEFAULT 50,
    youtube_playlists TEXT DEFAULT '[]'
);

-- Insert default settings
INSERT OR IGNORE INTO settings (id) VALUES (1);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON sessions(completed);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON achievements(unlocked);
`;

const migration_002 = `
-- Default achievements
INSERT OR IGNORE INTO achievements (id, name, description, icon, unlock_criteria_type, unlock_criteria_value) VALUES
('first_session', 'First Steps', 'Complete your first pomodoro session', '🌱', 'sessions_completed', 1),
('ten_sessions', 'Getting Started', 'Complete 10 pomodoro sessions', '🔥', 'sessions_completed', 10),
('fifty_sessions', 'Dedicated', 'Complete 50 pomodoro sessions', '⭐', 'sessions_completed', 50),
('hundred_sessions', 'Centurion', 'Complete 100 pomodoro sessions', '💯', 'sessions_completed', 100),
('five_hundred_sessions', 'Master', 'Complete 500 pomodoro sessions', '👑', 'sessions_completed', 500),
('streak_3', 'Consistent', 'Maintain a 3-day streak', '📅', 'streak_days', 3),
('streak_7', 'Week Warrior', 'Maintain a 7-day streak', '🗓️', 'streak_days', 7),
('streak_30', 'Monthly Master', 'Maintain a 30-day streak', '📆', 'streak_days', 30),
('ten_hours', 'Ten Hours', 'Accumulate 10 hours of focus time', '⏰', 'total_hours', 10),
('fifty_hours', 'Fifty Hours', 'Accumulate 50 hours of focus time', '⏳', 'total_hours', 50),
('hundred_hours', 'Hundred Hours', 'Accumulate 100 hours of focus time', '🏆', 'total_hours', 100);
`;

export async function initDatabase() {
  if (db) return db;

  try {
    // Initialize SQLite database
    db = await Database.load('sqlite:pulso.db');

    // Run migrations
    await db.execute(migration_001);
    await db.execute(migration_002);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

// Session operations
export async function createSession(session: Omit<Session, 'id' | 'created_at'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.execute(
    'INSERT INTO sessions (timestamp, duration, type, completed) VALUES (?, ?, ?, ?)',
    [session.timestamp, session.duration, session.type, session.completed]
  );
  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create session: no ID returned');
  }
  return result.lastInsertId;
}

export async function updateSession(id: number, completed: boolean, actualDuration?: number): Promise<void> {
  const database = await getDatabase();
  if (actualDuration !== undefined) {
    await database.execute(
      'UPDATE sessions SET completed = ?, duration = ? WHERE id = ?',
      [completed, actualDuration, id]
    );
  } else {
    await database.execute(
      'UPDATE sessions SET completed = ? WHERE id = ?',
      [completed, id]
    );
  }
}

export async function getSessions(limit?: number): Promise<Session[]> {
  const database = await getDatabase();
  const query = limit
    ? `SELECT * FROM sessions ORDER BY timestamp DESC LIMIT ${limit}`
    : 'SELECT * FROM sessions ORDER BY timestamp DESC';

  return await database.select<Session[]>(query);
}

export async function getSessionsByDateRange(startTimestamp: number, endTimestamp: number): Promise<Session[]> {
  const database = await getDatabase();
  return await database.select<Session[]>(
    'SELECT * FROM sessions WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC',
    [startTimestamp, endTimestamp]
  );
}

// Achievement operations
export async function getAchievements(): Promise<Achievement[]> {
  const database = await getDatabase();
  const rows = await database.select<any[]>('SELECT * FROM achievements ORDER BY unlock_criteria_value ASC');

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    unlock_criteria: {
      type: row.unlock_criteria_type,
      value: row.unlock_criteria_value,
    },
    unlocked: row.unlocked === 1,
    unlocked_at: row.unlocked_at,
  }));
}

export async function unlockAchievement(id: string): Promise<void> {
  const database = await getDatabase();
  await database.execute(
    'UPDATE achievements SET unlocked = 1, unlocked_at = CURRENT_TIMESTAMP WHERE id = ? AND unlocked = 0',
    [id]
  );
}

// Settings operations
export async function getSettings(): Promise<Settings> {
  const database = await getDatabase();
  const rows = await database.select<any[]>('SELECT * FROM settings WHERE id = 1');

  if (rows.length === 0) {
    throw new Error('Settings not found');
  }

  const row = rows[0];
  return {
    work_duration: row.work_duration,
    short_break_duration: row.short_break_duration,
    long_break_duration: row.long_break_duration,
    pomodoros_until_long_break: row.pomodoros_until_long_break,
    max_cycles: row.max_cycles ?? 0,
    show_title_bar: row.show_title_bar === 1 || row.show_title_bar === undefined,
    auto_start_breaks: row.auto_start_breaks === 1,
    auto_start_work: row.auto_start_work === 1,
    notification_sound: row.notification_sound === 1,
    notification_volume: row.notification_volume,
    youtube_playlists: JSON.parse(row.youtube_playlists || '[]'),
  };
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(settings).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    if (key === 'youtube_playlists') {
      values.push(JSON.stringify(value));
    } else if (typeof value === 'boolean') {
      values.push(value ? 1 : 0);
    } else {
      values.push(value);
    }
  });

  if (fields.length > 0) {
    await database.execute(
      `UPDATE settings SET ${fields.join(', ')} WHERE id = 1`,
      values
    );
  }
}

// Statistics operations
export async function getStatistics(): Promise<Statistics> {
  const database = await getDatabase();

  // Total sessions
  const totalResult = await database.select<any[]>(
    'SELECT COUNT(*) as count FROM sessions WHERE completed = "true"'
  );
  const total_sessions = totalResult[0]?.count || 0;

  // Total work and break time
  const timeResult = await database.select<any[]>(`
    SELECT
      SUM(CASE WHEN type = 'WORK' THEN duration ELSE 0 END) as work_time,
      SUM(CASE WHEN type IN ('SHORT_BREAK', 'LONG_BREAK') THEN duration ELSE 0 END) as break_time
    FROM sessions
    WHERE completed = "true"
  `);
  const total_work_time = timeResult[0]?.work_time || 0;
  const total_break_time = timeResult[0]?.break_time || 0;

  // Sessions today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const todayResult = await database.select<any[]>(
    'SELECT COUNT(*) as count FROM sessions WHERE completed = "true" AND timestamp >= ?',
    [todayTimestamp]
  );
  const sessions_today = todayResult[0]?.count || 0;

  // Sessions this week
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const weekResult = await database.select<any[]>(
    'SELECT COUNT(*) as count FROM sessions WHERE completed = "true" AND timestamp >= ?',
    [weekAgo]
  );
  const sessions_this_week = weekResult[0]?.count || 0;

  // Sessions this month
  const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const monthResult = await database.select<any[]>(
    'SELECT COUNT(*) as count FROM sessions WHERE completed = "true" AND timestamp >= ?',
    [monthAgo]
  );
  const sessions_this_month = monthResult[0]?.count || 0;

  // Calculate streaks
  const { current_streak, longest_streak } = await calculateStreaks();

  return {
    total_sessions,
    total_work_time,
    total_break_time,
    current_streak,
    longest_streak,
    sessions_today,
    sessions_this_week,
    sessions_this_month,
  };
}

async function calculateStreaks(): Promise<{ current_streak: number; longest_streak: number }> {
  const database = await getDatabase();

  // Get all work sessions ordered by date
  const sessions = await database.select<any[]>(`
    SELECT DATE(timestamp / 1000, 'unixepoch') as date
    FROM sessions
    WHERE completed = "true" AND type = 'WORK'
    GROUP BY DATE(timestamp / 1000, 'unixepoch')
    ORDER BY date DESC
  `);

  if (sessions.length === 0) {
    return { current_streak: 0, longest_streak: 0 };
  }

  let current_streak = 0;
  let longest_streak = 0;
  let streak = 0;
  let lastDate: Date | null = null;

  for (const session of sessions) {
    const currentDate = new Date(session.date);

    if (!lastDate) {
      // First iteration
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sessionDate = new Date(currentDate);
      sessionDate.setHours(0, 0, 0, 0);

      // Check if most recent session is today or yesterday
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        streak = 1;
        current_streak = 1;
      }
    } else {
      // Check if dates are consecutive
      const diffDays = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        if (current_streak > 0) {
          current_streak++;
        }
      } else {
        longest_streak = Math.max(longest_streak, streak);
        streak = 1;
        current_streak = 0;
      }
    }

    lastDate = currentDate;
  }

  longest_streak = Math.max(longest_streak, streak);

  return { current_streak, longest_streak };
}

// Check and unlock achievements based on current statistics
export async function checkAchievements(): Promise<Achievement[]> {
  const stats = await getStatistics();
  const achievements = await getAchievements();
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of achievements) {
    if (achievement.unlocked) continue;

    let shouldUnlock = false;

    switch (achievement.unlock_criteria.type) {
      case 'sessions_completed':
        shouldUnlock = stats.total_sessions >= achievement.unlock_criteria.value;
        break;
      case 'streak_days':
        shouldUnlock = stats.current_streak >= achievement.unlock_criteria.value;
        break;
      case 'total_hours':
        const totalHours = stats.total_work_time / 3600;
        shouldUnlock = totalHours >= achievement.unlock_criteria.value;
        break;
    }

    if (shouldUnlock) {
      await unlockAchievement(achievement.id);
      newlyUnlocked.push({ ...achievement, unlocked: true });
    }
  }

  return newlyUnlocked;
}
