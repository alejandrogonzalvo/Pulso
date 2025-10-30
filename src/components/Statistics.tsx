import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { currentTheme } from '../theme';
import { getStatistics, getAchievements } from '../services/database';
import { Statistics as StatisticsType, Achievement } from '../types';

interface StatisticsProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'statistics' | 'achievements';

export function Statistics({ isOpen, onClose }: StatisticsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('statistics');
  const [statistics, setStatistics] = useState<StatisticsType | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, achievementsData] = await Promise.all([
        getStatistics(),
        getAchievements()
      ]);
      setStatistics(stats);
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            className="absolute z-50 p-8 rounded-lg shadow-2xl"
            style={{
              backgroundColor: currentTheme.colors.idle,
              minWidth: '400px',
              maxWidth: '500px',
              top: '50%',
              left: '50%',
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.colors.text.primary }}>
              Statistics
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('statistics')}
                className="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: activeTab === 'statistics'
                    ? currentTheme.colors.button.primary
                    : currentTheme.colors.button.secondary,
                  color: activeTab === 'statistics'
                    ? currentTheme.colors.button.primaryText
                    : currentTheme.colors.text.secondary,
                }}
              >
                Stats
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: activeTab === 'achievements'
                    ? currentTheme.colors.button.primary
                    : currentTheme.colors.button.secondary,
                  color: activeTab === 'achievements'
                    ? currentTheme.colors.button.primaryText
                    : currentTheme.colors.text.secondary,
                }}
              >
                Achievements
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div
                  className="text-lg"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Loading...
                </div>
              </div>
            ) : activeTab === 'statistics' && statistics ? (
              <div className="space-y-6 mb-8">
                {/* Overall Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                    Overall
                  </h3>

                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.colors.text.secondary }}>
                      Total Sessions
                    </span>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      {statistics.total_sessions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.colors.text.secondary }}>
                      Total Focus Time
                    </span>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      {formatTime(statistics.total_work_time)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.colors.text.secondary }}>
                      Total Break Time
                    </span>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      {formatTime(statistics.total_break_time)}
                    </span>
                  </div>
                </div>

                {/* Streaks */}
                <div className="pt-4 border-t space-y-4" style={{ borderColor: currentTheme.colors.button.secondary }}>
                  <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                    Streaks
                  </h3>

                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.colors.text.secondary }}>
                      Current Streak
                    </span>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      {statistics.current_streak} {statistics.current_streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.colors.text.secondary }}>
                      Longest Streak
                    </span>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      {statistics.longest_streak} {statistics.longest_streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              </div>
            ) : activeTab === 'achievements' ? (
              <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: achievement.unlocked
                          ? currentTheme.colors.button.secondary
                          : `${currentTheme.colors.button.secondary}60`,
                        opacity: achievement.unlocked ? 1 : 0.5,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🏆</div>
                        <div className="flex-1">
                          <div
                            className="font-semibold"
                            style={{ color: currentTheme.colors.text.primary }}
                          >
                            {achievement.name}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: currentTheme.colors.text.secondary }}
                          >
                            {achievement.description}
                          </div>
                          {achievement.unlocked && achievement.unlocked_at && (
                            <div
                              className="text-xs mt-1"
                              style={{ color: currentTheme.colors.text.secondary }}
                            >
                              Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div
                      className="text-lg"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      No achievements available
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div
                  className="text-lg"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  No data available
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-6 py-3 rounded-full font-semibold"
              style={{
                backgroundColor: currentTheme.colors.button.primary,
                color: currentTheme.colors.button.primaryText,
              }}
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
