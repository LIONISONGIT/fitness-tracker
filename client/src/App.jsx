import React, { useState, useEffect } from 'react';
import CalorieCalculator from './pages/CalorieCalculator';
import JourneyTracker from './pages/JourneyTracker';
import TimeEstimator from './pages/TimeEstimator';
import Dashboard from './pages/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import Login from './pages/Login';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // Force re-render when storage changes (for dashboard updates)
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token'));



  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleStorageChange = () => {
      // Simple hack to force re-render of dashboard
      setUpdateTrigger(prev => prev + 1);
    };
    window.addEventListener('db-update', handleStorageChange);
    return () => window.removeEventListener('db-update', handleStorageChange);
  }, []);

  const NavButton = ({ id, label, colorClass }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm md:text-base whitespace-nowrap ${activeTab === id
        ? `${colorClass} text-white shadow-lg shadow-${colorClass.replace('bg-', '')}/20`
        : 'text-text-muted hover:text-text hover:bg-darker/10'
        }`}
    >
      {label}
    </button>
  );

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div className="min-h-screen bg-darker text-text p-4 md:p-8 pb-24 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              FACON
            </h1>
            <p className="text-gray-400 text-sm">AI-Powered Fitness Command Center</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-xl"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setToken(null);
                }}
                className="text-gray-400 hover:text-text text-xs uppercase font-bold tracking-wider"
              >
                Logout
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Online
              </div>
            </div>
          </div>
        </header>

        <nav className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar justify-center md:justify-start">
          <NavButton id="dashboard" label="Dashboard" colorClass="bg-blue-600" />
          <NavButton id="calculator" label="Calculator" colorClass="bg-purple-600" />
          <NavButton id="tracker" label="Journey" colorClass="bg-secondary" />
          <NavButton id="estimator" label="Estimator" colorClass="bg-orange-500" />
        </nav>

        <main className="transition-all duration-300 ease-in-out min-h-[500px]">
          {activeTab === 'dashboard' && <Dashboard key={updateTrigger} />}
          {activeTab === 'calculator' && <CalorieCalculator />}
          {activeTab === 'tracker' && <JourneyTracker />}
          {activeTab === 'estimator' && <TimeEstimator />}
        </main>

        <footer className="mt-16 text-center text-gray-600 text-sm border-t border-gray-800 pt-8">
          <p>© {new Date().getFullYear()} FACON. Powered by Mistral AI.</p>
        </footer>
      </div>

      {/* Global Chat Assistant */}
      <ChatAssistant />
    </div>
  );
}

export default App;
