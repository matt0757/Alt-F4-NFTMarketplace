import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import useAuth from AuthContext
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import BackgroundAnimation from './components/BackgroundAnimation';
import { RegisterEnokiWallets } from './components/RegisterEnokiWallets';

// Create a QueryClient instance
const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

function AppContent() {
  const { user, loading, error, login, logout, credentials, addCredential, removeCredential } = useAuth();

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
      <div className="min-h-screen relative flex items-center justify-center">
        <BackgroundAnimation />
        <div className="text-white text-xl relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <BackgroundAnimation />
      <div className="relative z-10 w-full flex items-center justify-center">
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
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <RegisterEnokiWallets />
        <WalletProvider autoConnect>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
