import { SESSION_CONFIG, SECURITY_PROFILES } from './session';

export type SecurityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Apply a security profile to the current session configuration
 * @param level - Security level to apply
 */
export function applySecurityProfile(level: SecurityLevel) {
  const profile = SECURITY_PROFILES[level];
  
  // Update the session configuration
  SESSION_CONFIG.TIMEOUT = profile.TIMEOUT;
  SESSION_CONFIG.WARNING_TIME = profile.WARNING_TIME;
  
  console.log(`🔒 Applied ${level} security profile:`, {
    sessionTimeout: `${profile.TIMEOUT / (60 * 60 * 1000)} hours`,
    warningTime: `${profile.WARNING_TIME / (60 * 1000)} minutes`,
  });
}

/**
 * Get the current session timeout in a human-readable format
 */
export function getSessionTimeoutDisplay() {
  const hours = Math.floor(SESSION_CONFIG.TIMEOUT / (60 * 60 * 1000));
  const minutes = Math.floor((SESSION_CONFIG.TIMEOUT % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Force session expiry (useful for testing or admin logout)
 */
export function forceSessionExpiry() {
  localStorage.removeItem(SESSION_CONFIG.KEYS.SESSION);
  localStorage.removeItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY);
  window.location.reload();
}
