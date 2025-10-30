import { useEffect, useState } from 'react'
import { Timer } from './components/Timer'
import { initDatabase, getSettings } from './services/database'
import { getCurrentWindow } from '@tauri-apps/api/window'

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize database and apply settings
    initDatabase().then(async () => {
      // Apply title bar setting
      try {
        const settings = await getSettings();
        const window = getCurrentWindow();
        await window.setDecorations(settings.show_title_bar);
      } catch (error) {
        console.error('Failed to apply title bar setting:', error);
      }
      setIsReady(true);
    }).catch((error) => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return <Timer />;
}

export default App
