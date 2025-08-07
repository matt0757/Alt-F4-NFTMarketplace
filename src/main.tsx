import React from 'react';
import ReactDOM from 'react-dom/client';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerEnokiWallets } from '@mysten/enoki';
import App from './App.tsx';
import './index.css';

// Get environment variables
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const enokiApiKey = import.meta.env.VITE_ENOKI_API_KEY;
const network = import.meta.env.VITE_NETWORK || 'testnet'; // Default to testnet

console.log('🔍 Environment check:', {
  googleClientId,
  enokiApiKey: enokiApiKey ? '***' : undefined, // Hide the actual key in logs
  network,
  allEnvVars: import.meta.env
});

// Create network configuration
const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

// Create SuiClient for Enoki
const suiClient = new SuiClient({ url: getFullnodeUrl(network as 'devnet' | 'testnet' | 'mainnet') });

// Only register Enoki wallets if we have both required credentials
if (googleClientId && enokiApiKey) {
  try {
    const enokiConfig = {
      providers: {
        google: {
          clientId: googleClientId,
        },
      },
      apiKey: enokiApiKey,
      client: suiClient,
      network: network as 'devnet' | 'testnet' | 'mainnet',
    };
    
    console.log('🔧 Registering Enoki wallets with config:', {
      ...enokiConfig,
      apiKey: '***', // Hide the actual key in logs
      client: 'SuiClient instance'
    });
    registerEnokiWallets(enokiConfig);
    console.log(`✅ Enoki wallets registered successfully for ${network}`);
  } catch (error) {
    console.error('❌ Failed to register Enoki wallets:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : error);
  }
} else {
  const missing = [];
  if (!googleClientId) missing.push('VITE_GOOGLE_CLIENT_ID');
  if (!enokiApiKey) missing.push('VITE_ENOKI_API_KEY');
  console.warn(`⚠️ Missing required environment variables: ${missing.join(', ')}`);
}

// Create a query client
const queryClient = new QueryClient();

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
