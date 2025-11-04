import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TimerState, TimerContext } from '../types';
import { timerService } from '../services/timer';
import { currentTheme, getBackgroundStyle } from '../theme';
import { playClickSound, playStartClickSound } from '../utils/sound';
import { Settings } from './Settings';
import { Statistics } from './Statistics';
import { ConfirmDialog } from './ConfirmDialog';

export function Timer() {
  const [context, setContext] = useState<TimerContext | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = timerService.subscribe((newContext) => {
      setContext(newContext);
    });

    return unsubscribe;
  }, []);

  if (!context) {
    return <div>Loading...</div>;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateBackground = () => {
    const theme = currentTheme.colors;
    switch (context.state) {
      case TimerState.WORK:
        return getBackgroundStyle(theme.work);
      case TimerState.SHORT_BREAK:
        return getBackgroundStyle(theme.shortBreak);
      case TimerState.LONG_BREAK:
        return getBackgroundStyle(theme.longBreak);
      case TimerState.PAUSED:
        return getBackgroundStyle(theme.paused);
      default:
        return getBackgroundStyle(theme.idle);
    }
  };

  const getStateText = () => {
    switch (context.state) {
      case TimerState.WORK:
        return 'Focus Time';
      case TimerState.SHORT_BREAK:
        return 'Short Break';
      case TimerState.LONG_BREAK:
        return 'Long Break';
      case TimerState.PAUSED:
        return 'Paused';
      default:
        return 'Ready';
    }
  };

  const isRunning = context.state === TimerState.WORK ||
                    context.state === TimerState.SHORT_BREAK ||
                    context.state === TimerState.LONG_BREAK;

  const isPaused = context.state === TimerState.PAUSED;

  const handleButtonClick = (action: () => void) => {
    playClickSound();
    action();
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center fixed inset-0"
      style={getStateBackground()}
    >
      {/* Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-30"
        style={{
          backgroundColor: currentTheme.colors.button.secondary,
          color: currentTheme.colors.text.primary,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* Statistics Button */}
      <button
        onClick={() => setIsStatisticsOpen(true)}
        className="fixed bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-30"
        style={{
          backgroundColor: currentTheme.colors.button.secondary,
          color: currentTheme.colors.text.primary,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      </button>

      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <Statistics isOpen={isStatisticsOpen} onClose={() => setIsStatisticsOpen(false)} />
      <ConfirmDialog
        isOpen={isStopConfirmOpen}
        title="Stop Session?"
        onConfirm={() => {
          setIsStopConfirmOpen(false);
          timerService.stop();
        }}
        onCancel={() => setIsStopConfirmOpen(false)}
      />

      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* State Label */}
          <motion.h2
            className="text-2xl font-semibold mb-8"
            style={{ color: currentTheme.colors.text.primary }}
            key={context.state}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {getStateText()}
          </motion.h2>

          {/* Timer Circle */}
          <div className="relative mb-12">
            <motion.div
              className="w-80 h-80 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="text-center">
                <div
                  className="text-8xl font-bold mb-4"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {formatTime(context.timeRemaining)}
                </div>
                <div
                  className="text-lg"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  Session {context.currentSession}
                </div>
              </div>
            </motion.div>

            {/* Progress Ring */}
            <svg className="absolute top-0 left-0 w-80 h-80 -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="155"
                stroke={`${currentTheme.colors.text.primary}20`}
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="160"
                cy="160"
                r="155"
                stroke={currentTheme.colors.text.primary}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 155}
                animate={{
                  strokeDashoffset: context.state !== TimerState.IDLE
                    ? (2 * Math.PI * 155) - ((context.timeRemaining / (
                        context.state === TimerState.WORK
                          ? context.settings.work_duration * 60
                          : context.state === TimerState.SHORT_BREAK
                          ? context.settings.short_break_duration * 60
                          : context.settings.long_break_duration * 60
                      )) * (2 * Math.PI * 155))
                    : 2 * Math.PI * 155
                }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </svg>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center">
            {context.state === TimerState.IDLE && (
              <motion.button
                onClick={() => {
                  playStartClickSound();
                  timerService.start();
                }}
                className="px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                style={{
                  backgroundColor: currentTheme.colors.button.primary,
                  color: currentTheme.colors.button.primaryText,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start
              </motion.button>
            )}

            {isRunning && (
              <>
                <motion.button
                  onClick={() => handleButtonClick(() => timerService.pause())}
                  className="px-8 py-4 backdrop-blur-sm rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                  style={{
                    backgroundColor: currentTheme.colors.button.secondary,
                    color: currentTheme.colors.button.secondaryText,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Pause
                </motion.button>
                <motion.button
                  onClick={() => handleButtonClick(() => timerService.skip())}
                  className="px-8 py-4 backdrop-blur-sm rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                  style={{
                    backgroundColor: currentTheme.colors.button.secondary,
                    color: currentTheme.colors.button.secondaryText,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Skip
                </motion.button>
                <motion.button
                  onClick={() => handleButtonClick(() => setIsStopConfirmOpen(true))}
                  className="px-8 py-4 backdrop-blur-sm rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                  style={{
                    backgroundColor: currentTheme.colors.button.secondary,
                    color: currentTheme.colors.button.secondaryText,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Stop
                </motion.button>
              </>
            )}

            {isPaused && (
              <>
                <motion.button
                  onClick={() => handleButtonClick(() => timerService.start())}
                  className="px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                  style={{
                    backgroundColor: currentTheme.colors.button.primary,
                    color: currentTheme.colors.button.primaryText,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Resume
                </motion.button>
                <motion.button
                  onClick={() => handleButtonClick(() => setIsStopConfirmOpen(true))}
                  className="px-8 py-4 backdrop-blur-sm rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                  style={{
                    backgroundColor: currentTheme.colors.button.secondary,
                    color: currentTheme.colors.button.secondaryText,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Stop
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
