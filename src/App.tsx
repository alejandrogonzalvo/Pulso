import { useEffect, useState } from 'react'
import { Timer } from './components/Timer'
import { initDatabase } from './services/database'

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize database
    initDatabase().then(() => {
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
