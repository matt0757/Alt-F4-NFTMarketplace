import React from 'react';
import ReactDOM from 'react-dom/client';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerEnokiWallets } from '@mysten/enoki';
import App from './App.tsx';
import './index.css';

// Get environment variables
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const network = import.meta.env.VITE_NETWORK || 'testnet'; // Default to testnet

console.log('🔍 Environment check:', {
  googleClientId,
  network,
  allEnvVars: import.meta.env
});

// Only register Enoki wallets if we have the client ID
if (googleClientId) {
  try {
    registerEnokiWallets({
      clientId: googleClientId,
      network: network as 'devnet' | 'testnet' | 'mainnet', // Use environment variable
    });
    console.log(`✅ Enoki wallets registered successfully for ${network}`);
  } catch (error) {
    console.error('❌ Failed to register Enoki wallets:', error);
  }
} else {
  console.warn('⚠️ VITE_GOOGLE_CLIENT_ID not found in environment variables');
}

// Create a query client
const queryClient = new QueryClient();

// Create network configuration
const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={network as 'devnet' | 'testnet' | 'mainnet'}>
        <WalletProvider>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
