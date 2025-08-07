import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import LoginScreen from './components/LoginScreen';
import MarketplaceDashboard from './components/MarketplaceDashboard';
import BackgroundAnimation from './components/BackgroundAnimation';
import { RegisterEnokiWallets } from './components/RegisterEnokiWallets';
import { LogOut, User as UserIcon } from 'lucide-react';

// Create a QueryClient instance
const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

function AppContent() {
  const { user, loading, logout } = useAuth();
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    console.log('🔍 Auth state changed:');
    console.log('  - User:', user);
    console.log('  - Loading:', loading);
    console.log('  - User exists?', !!user);
    console.log('  - Current account:', currentAccount?.address);
  }, [user, loading, currentAccount]);

  console.log('🎯 RENDER: Showing', user ? (currentAccount ? 'App' : 'Connecting wallet') : 'LoginScreen');

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <BackgroundAnimation />
        <LoginScreen />
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Connecting wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <MarketplaceProvider>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <BackgroundAnimation />
        
        {/* Simple Top Navigation */}
        <nav className="relative z-10 p-4 border-b border-gray-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">NFT Marketplace</h1>
            
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center space-x-2 text-gray-300">
                <UserIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{user.name || user.email || 'User'}</span>
                <span className="text-xs text-gray-500 font-mono">
                  {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="glass-button rounded-lg px-4 py-2 text-white flex items-center space-x-2 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Marketplace Content */}
        <div className="relative z-10">
          <MarketplaceDashboard />
        </div>
      </div>
    </MarketplaceProvider>
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
