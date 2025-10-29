import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { currentTheme } from '../theme';
import { settingsStore } from '../store/settings';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const [soundsDisabled, setSoundsDisabled] = useState(settingsStore.getState().soundsDisabled);

  useEffect(() => {
    const unsubscribe = settingsStore.subscribe((state) => {
      setSoundsDisabled(state.soundsDisabled);
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    const newValue = !soundsDisabled;
    setSoundsDisabled(newValue);
    settingsStore.setSoundsDisabled(newValue);
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
              top: '50%',
              left: '50%',
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.colors.text.primary }}>
              Settings
            </h2>

            <div className="flex items-center justify-between mb-6">
              <span className="text-lg" style={{ color: currentTheme.colors.text.secondary }}>
                Disable sounds
              </span>
              <button
                onClick={handleToggle}
                className="relative w-14 h-8 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: soundsDisabled
                    ? currentTheme.colors.button.primary
                    : currentTheme.colors.button.secondary,
                }}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                  animate={{
                    left: soundsDisabled ? 'calc(100% - 28px)' : '4px',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
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
