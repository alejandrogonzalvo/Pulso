import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { currentTheme } from '../theme';
import { settingsStore } from '../store/settings';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const [settings, setSettings] = useState(settingsStore.getState());
  const [inputValues, setInputValues] = useState({
    focusTime: String(settingsStore.getState().focusTime),
    shortBreakTime: String(settingsStore.getState().shortBreakTime),
    longBreakTime: String(settingsStore.getState().longBreakTime),
    intervalsBeforeLongBreak: String(settingsStore.getState().intervalsBeforeLongBreak),
    maxCycles: String(settingsStore.getState().maxCycles),
  });

  useEffect(() => {
    const unsubscribe = settingsStore.subscribe((state) => {
      setSettings(state);
      setInputValues({
        focusTime: String(state.focusTime),
        shortBreakTime: String(state.shortBreakTime),
        longBreakTime: String(state.longBreakTime),
        intervalsBeforeLongBreak: String(state.intervalsBeforeLongBreak),
        maxCycles: String(state.maxCycles),
      });
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    settingsStore.setSoundsDisabled(!settings.soundsDisabled);
  };

  const handleTitleBarToggle = async () => {
    const newValue = !settings.showTitleBar;
    settingsStore.setShowTitleBar(newValue);

    // Update Tauri window decorations
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const window = getCurrentWindow();
    await window.setDecorations(newValue);
  };

  const handleInputChange = (field: keyof typeof inputValues, value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
  };

  const handleInputBlur = (field: keyof typeof inputValues, min: number, max: number) => {
    const value = parseInt(inputValues[field], 10);
    const validValue = isNaN(value) || value < min ? min : value > max ? max : value;

    switch (field) {
      case 'focusTime':
        settingsStore.setFocusTime(validValue);
        break;
      case 'shortBreakTime':
        settingsStore.setShortBreakTime(validValue);
        break;
      case 'longBreakTime':
        settingsStore.setLongBreakTime(validValue);
        break;
      case 'intervalsBeforeLongBreak':
        settingsStore.setIntervalsBeforeLongBreak(validValue);
        break;
      case 'maxCycles':
        settingsStore.setMaxCycles(validValue);
        break;
    }
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
              maxHeight: '90vh',
              top: '50%',
              left: '50%',
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.colors.text.primary }}>
              Settings
            </h2>

            <div className="space-y-6 mb-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              {/* Timer Duration Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                  Timer Durations
                </h3>

                <div className="flex items-center justify-between">
                  <span style={{ color: currentTheme.colors.text.secondary }}>
                    Focus time (minutes)
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputValues.focusTime}
                    onChange={(e) => handleInputChange('focusTime', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleInputBlur('focusTime', 1, 120)}
                    className="w-20 px-3 py-2 rounded text-center"
                    style={{
                      backgroundColor: currentTheme.colors.button.secondary,
                      color: currentTheme.colors.text.primary,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: currentTheme.colors.text.secondary }}>
                    Short break (minutes)
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputValues.shortBreakTime}
                    onChange={(e) => handleInputChange('shortBreakTime', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleInputBlur('shortBreakTime', 1, 60)}
                    className="w-20 px-3 py-2 rounded text-center"
                    style={{
                      backgroundColor: currentTheme.colors.button.secondary,
                      color: currentTheme.colors.text.primary,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: currentTheme.colors.text.secondary }}>
                    Long break (minutes)
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputValues.longBreakTime}
                    onChange={(e) => handleInputChange('longBreakTime', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleInputBlur('longBreakTime', 1, 120)}
                    className="w-20 px-3 py-2 rounded text-center"
                    style={{
                      backgroundColor: currentTheme.colors.button.secondary,
                      color: currentTheme.colors.text.primary,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: currentTheme.colors.text.secondary }}>
                    Intervals before long break
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputValues.intervalsBeforeLongBreak}
                    onChange={(e) => handleInputChange('intervalsBeforeLongBreak', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleInputBlur('intervalsBeforeLongBreak', 1, 10)}
                    className="w-20 px-3 py-2 rounded text-center"
                    style={{
                      backgroundColor: currentTheme.colors.button.secondary,
                      color: currentTheme.colors.text.primary,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: currentTheme.colors.text.secondary }}>
                    Max cycles (0 = endless)
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputValues.maxCycles}
                    onChange={(e) => handleInputChange('maxCycles', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleInputBlur('maxCycles', 0, 100)}
                    className="w-20 px-3 py-2 rounded text-center"
                    style={{
                      backgroundColor: currentTheme.colors.button.secondary,
                      color: currentTheme.colors.text.primary,
                    }}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t space-y-4" style={{ borderColor: currentTheme.colors.button.secondary }}>
                <div className="flex items-center justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.text.secondary }}>
                    Show title bar
                  </span>
                  <button
                    onClick={handleTitleBarToggle}
                    className="relative w-14 h-8 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: settings.showTitleBar
                        ? currentTheme.colors.button.primary
                        : currentTheme.colors.button.secondary,
                    }}
                  >
                    <motion.div
                      className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                      animate={{
                        left: settings.showTitleBar ? 'calc(100% - 28px)' : '4px',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.text.secondary }}>
                    Disable sounds
                  </span>
                  <button
                    onClick={handleToggle}
                    className="relative w-14 h-8 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: settings.soundsDisabled
                        ? currentTheme.colors.button.primary
                        : currentTheme.colors.button.secondary,
                    }}
                  >
                    <motion.div
                      className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                      animate={{
                        left: settings.soundsDisabled ? 'calc(100% - 28px)' : '4px',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg" style={{ color: currentTheme.colors.text.secondary }}>
                    Show motivational quotes
                  </span>
                  <button
                    onClick={() => settingsStore.setShowMotivationalQuotes(!settings.showMotivationalQuotes)}
                    className="relative w-14 h-8 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: settings.showMotivationalQuotes
                        ? currentTheme.colors.button.primary
                        : currentTheme.colors.button.secondary,
                    }}
                  >
                    <motion.div
                      className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                      animate={{
                        left: settings.showMotivationalQuotes ? 'calc(100% - 28px)' : '4px',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </div>

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
