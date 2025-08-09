# Secure Authentication System

This project now implements a secure session-based authentication system to prevent automatic logins and improve security.

## Key Security Features

### 1. Session-Based Authentication
- **No Auto-Connect**: Removed `autoConnect` from WalletProvider to prevent automatic wallet connections
- **Session Expiry**: Sessions automatically expire after 24 hours by default
- **Activity Tracking**: User activity extends session lifetime automatically
- **Secure Storage**: Session data is stored locally but expires properly

### 2. Session Management
- **Configurable Timeouts**: Easy to adjust session duration for different security needs
- **Activity Detection**: Tracks mouse, keyboard, and touch interactions
- **Automatic Cleanup**: Sessions are cleared on browser close or logout
- **Warning System**: Users get notified before session expiry

### 3. Security Profiles

Three pre-configured security levels are available:

#### High Security (2 hours)
```typescript
applySecurityProfile('HIGH');
```
- Session timeout: 2 hours
- Warning time: 2 minutes
- Best for: Sensitive environments

#### Medium Security (8 hours) 
```typescript
applySecurityProfile('MEDIUM');
```
- Session timeout: 8 hours  
- Warning time: 5 minutes
- Best for: Normal business use

#### Low Security (24 hours - Default)
```typescript
applySecurityProfile('LOW');
```
- Session timeout: 24 hours
- Warning time: 10 minutes
- Best for: Development and convenience

## Configuration

### Basic Session Configuration
Edit `src/config/session.ts`:

```typescript
export const SESSION_CONFIG = {
  TIMEOUT: 24 * 60 * 60 * 1000,        // 24 hours
  WARNING_TIME: 5 * 60 * 1000,          // 5 minutes warning
  KEYS: {
    SESSION: 'enoki_session',
    LAST_ACTIVITY: 'enoki_last_activity',
  },
  ACTIVITY_EVENTS: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
};
```

### Custom Security Profile
```typescript
import { applySecurityProfile } from './src/config/security';

// Apply during app initialization
applySecurityProfile('HIGH'); // or 'MEDIUM', 'LOW'
```

## User Experience

### Login Flow
1. **First Visit**: User sees login screen with security information
2. **Authentication**: User authenticates via Google OAuth through Enoki
3. **Session Start**: 24-hour session begins with activity tracking
4. **Activity Extension**: Session automatically extends with user interaction

### Session Expiry
1. **Warning**: 5-minute warning before session expiry
2. **Options**: User can extend session or logout
3. **Auto-Logout**: Automatic logout when session expires
4. **Clean State**: All session data cleared on logout

### Browser Restart
- **Required Re-auth**: Users must authenticate again after browser restart
- **No Auto-Connect**: Enoki will not automatically reconnect wallets
- **Secure Default**: Always starts with login screen for security

## Implementation Details

### AuthContext Changes
- Added `isSessionValid` state management
- Session validation on app initialization  
- Activity tracking with configurable events
- Secure logout with complete state cleanup

### Components Added
- `SessionTimeout`: Warning component for session expiry
- Configurable security profiles
- User-friendly session management UI

### Security Considerations
- **Browser Storage**: Uses localStorage but with proper expiry
- **Cross-Tab Support**: Session shared across tabs but expires consistently
- **Memory Cleanup**: Complete state reset on logout
- **No Persistent Tokens**: Session data doesn't persist across browser restarts

## Testing the Security

### Test Session Expiry
1. Set a short timeout for testing:
```typescript
SESSION_CONFIG.TIMEOUT = 60 * 1000; // 1 minute
SESSION_CONFIG.WARNING_TIME = 10 * 1000; // 10 seconds warning
```

2. Login and wait for automatic logout

### Test Browser Restart
1. Login to the application
2. Close browser completely
3. Reopen browser and navigate to app
4. Should see login screen (not automatic connection)

### Test Activity Extension
1. Login to the application
2. Monitor session in browser developer tools
3. Interact with the page (click, scroll, type)
4. Verify `enoki_last_activity` timestamp updates

## Security Benefits

1. **Prevents Unauthorized Access**: No automatic login after browser close
2. **Session Timeout**: Automatic logout after inactivity period
3. **User Awareness**: Clear indication of session status and expiry
4. **Configurable Security**: Adjustable based on security requirements
5. **Clean State Management**: Proper cleanup prevents state corruption

## Migration from Auto-Connect

The previous implementation used `autoConnect={true}` which caused:
- Automatic wallet connection on page load
- No session management
- Users staying logged in indefinitely
- Security concerns with unattended devices

The new implementation provides:
- Explicit authentication required
- Time-bounded sessions
- Activity-based session extension
- Secure logout and cleanup
