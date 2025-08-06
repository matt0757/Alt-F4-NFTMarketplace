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
