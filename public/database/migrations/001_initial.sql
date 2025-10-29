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
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Only one row allowed
    work_duration INTEGER NOT NULL DEFAULT 25,
    short_break_duration INTEGER NOT NULL DEFAULT 5,
    long_break_duration INTEGER NOT NULL DEFAULT 15,
    pomodoros_until_long_break INTEGER NOT NULL DEFAULT 4,
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
