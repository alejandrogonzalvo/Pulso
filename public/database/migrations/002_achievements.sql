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
