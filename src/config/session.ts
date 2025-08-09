// Session management configuration
export const SESSION_CONFIG = {
  // Session timeout in milliseconds (24 hours by default)
  TIMEOUT: 24 * 60 * 60 * 1000,
  
  // Warning time before session expiry (5 minutes by default)
  WARNING_TIME: 5 * 60 * 1000,
  
  // Local storage keys
  KEYS: {
    SESSION: 'enoki_session',
    LAST_ACTIVITY: 'enoki_last_activity',
  },
  
  // Activity events to track for session extension
  ACTIVITY_EVENTS: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
};

// You can modify these values for different security levels:
// - For higher security: reduce TIMEOUT to 2-6 hours
// - For development: increase TIMEOUT to avoid frequent re-logins
// - For production: keep 24 hours as a good balance

export const SECURITY_PROFILES = {
  HIGH: {
    TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
    WARNING_TIME: 2 * 60 * 1000,  // 2 minutes warning
  },
  MEDIUM: {
    TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
    WARNING_TIME: 5 * 60 * 1000,  // 5 minutes warning
  },
  LOW: {
    TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    WARNING_TIME: 10 * 60 * 1000,  // 10 minutes warning
  },
};
