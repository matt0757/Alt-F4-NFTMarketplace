import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { zkLoginService } from './services/zkLoginService';

function AppContent() {
  const { user, loading, error, login, logout, credentials, addCredential, removeCredential } = useAuth();

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const checkCallback = async () => {
      if (window.location.hash.includes('id_token')) {
        try {
          const callbackUser = await zkLoginService.handleCallback();
          if (callbackUser) {
            // Update the auth context with the user data
            // This would normally be handled by the login function
            window.location.reload(); // Simple reload to update state
          }
        } catch (err) {
          console.error('Callback error:', err);
        }
      }
    };

    checkCallback();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {user ? (
        <Dashboard 
          user={user} 
          credentials={credentials}
          onLogout={logout}
          onAddCredential={addCredential}
          onRemoveCredential={removeCredential}
        />
      ) : (
        <LoginScreen onLogin={login} error={error} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
