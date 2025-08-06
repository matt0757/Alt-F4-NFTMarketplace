import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard'; // Import Dashboard instead of LandingPage
import { zkLoginService } from './services/zkLoginService';

function AppContent() {
  const { user, loading, error, login, logout, credentials, addCredential, removeCredential } = useAuth();

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const checkCallback = async () => {
      console.log('=== CALLBACK DEBUG START ===');
      console.log('Checking callback, current hash:', window.location.hash);
      console.log('Hash includes id_token:', window.location.hash.includes('id_token'));
      
      if (window.location.hash.includes('id_token')) {
        console.log('Processing OAuth callback...');
        try {
          console.log('Calling zkLoginService.handleCallback()...');
          const callbackUser = await zkLoginService.handleCallback();
          console.log('Callback user result:', callbackUser);
          console.log('Type of callbackUser:', typeof callbackUser);
          console.log('Is callbackUser truthy?', !!callbackUser);
          
          if (callbackUser) {
            console.log('Calling login with user:', callbackUser);
            const loginResult = await login(callbackUser);
            console.log('Login function result:', loginResult);
            console.log('Login completed, clearing hash...');
            // Clear the URL hash to prevent re-processing
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            console.log('❌ No user returned from handleCallback');
          }
        } catch (err) {
          console.error('❌ Callback error:', err);
        }
      }
      console.log('=== CALLBACK DEBUG END ===');
    };

    checkCallback();
  }, [login]);

  useEffect(() => {
    console.log('🔍 Auth state changed:');
    console.log('  - User:', user);
    console.log('  - Loading:', loading);
    console.log('  - Error:', error);
    console.log('  - User exists?', !!user);
  }, [user, loading, error]);

  console.log('🎯 RENDER: Showing', user ? 'Dashboard' : 'LoginScreen');

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
