import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TimerState, TimerContext } from '../types';
import { timerService } from '../services/timer';
import { currentTheme, getBackgroundStyle } from '../theme';

export function Timer() {
  const [context, setContext] = useState<TimerContext | null>(null);

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

  return (
    <div
      className="w-screen h-screen flex items-center justify-center fixed inset-0"
      style={getStateBackground()}
    >
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
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: context.state !== TimerState.IDLE
                    ? context.timeRemaining / (
                        context.state === TimerState.WORK
                          ? context.settings.work_duration * 60
                          : context.state === TimerState.SHORT_BREAK
                          ? context.settings.short_break_duration * 60
                          : context.settings.long_break_duration * 60
                      )
                    : 0
                }}
                style={{
                  strokeDasharray: `${2 * Math.PI * 155}`,
                  strokeDashoffset: 0,
                }}
                transition={{ duration: 0.3 }}
              />
            </svg>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center">
            {context.state === TimerState.IDLE && (
              <motion.button
                onClick={() => timerService.start()}
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
                  onClick={() => timerService.pause()}
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
                  onClick={() => timerService.skip()}
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
                  onClick={() => timerService.stop()}
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
                  onClick={() => timerService.start()}
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
                  onClick={() => timerService.stop()}
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
