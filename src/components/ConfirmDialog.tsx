import { motion, AnimatePresence } from 'framer-motion';
import { currentTheme } from '../theme';
import { playClickSound } from '../utils/sound';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgb(0, 0, 0)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: currentTheme.colors.button.secondary,
              color: currentTheme.colors.text.primary,
            }}
          >
            <h3 className="text-xl font-semibold mb-6">{title}</h3>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  playClickSound();
                  onCancel();
                }}
                className="px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                style={{
                  backgroundColor: currentTheme.colors.button.secondary,
                  color: currentTheme.colors.button.secondaryText,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onConfirm();
                }}
                className="px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                style={{
                  backgroundColor: currentTheme.colors.button.primary,
                  color: currentTheme.colors.button.primaryText,
                }}
              >
                Stop Session
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}