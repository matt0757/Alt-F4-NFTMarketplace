import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SESSION_CONFIG } from '../config/session';
import { Clock, X } from 'lucide-react';

export default function SessionTimeout() {
  const { logout, isSessionValid } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isSessionValid) return;

    const checkSessionTimeout = () => {
      const lastActivity = localStorage.getItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY);
      if (!lastActivity) return;

      const lastActivityTime = parseInt(lastActivity);
      const now = Date.now();
      const timeSinceActivity = now - lastActivityTime;
      const timeUntilExpiry = SESSION_CONFIG.TIMEOUT - timeSinceActivity;

      if (timeUntilExpiry <= SESSION_CONFIG.WARNING_TIME && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeLeft(Math.ceil(timeUntilExpiry / 1000));
      } else if (timeUntilExpiry <= 0) {
        logout();
      } else {
        setShowWarning(false);
      }
    };

    const interval = setInterval(checkSessionTimeout, 1000);
    return () => clearInterval(interval);
  }, [isSessionValid, logout]);

  const extendSession = () => {
    localStorage.setItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY, Date.now().toString());
    setShowWarning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 glass-panel border-yellow-500/30 max-w-sm">
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-400">Session Expiring Soon</h3>
            <p className="text-xs text-gray-300 mt-1">
              Your session will expire in {formatTime(timeLeft)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="px-4 pb-4 flex space-x-2">
        <button
          onClick={extendSession}
          className="flex-1 px-3 py-2 bg-yellow-500 text-black text-xs font-medium rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Stay Logged In
        </button>
        <button
          onClick={logout}
          className="flex-1 px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
