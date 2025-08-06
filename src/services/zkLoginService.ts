import { EnokiFlow } from '@mysten/enoki';
import { SuiClient } from '@mysten/sui.js/client';
import { User } from '../types';

const ENOKI_API_KEY = import.meta.env.VITE_ENOKI_API_KEY;
const SUI_NETWORK = import.meta.env.VITE_SUI_NETWORK || 'testnet';

class ZkLoginService {
  private enokiFlow: EnokiFlow;
  private suiClient: SuiClient;

  constructor() {
    console.log('🔑 API Key:', ENOKI_API_KEY);
    console.log('🌐 Network:', SUI_NETWORK);
    
    if (!ENOKI_API_KEY) {
      throw new Error('Enoki API key not configured. Please set VITE_ENOKI_API_KEY in your .env file.');
    }

    // Initialize Enoki Flow
    this.enokiFlow = new EnokiFlow({
      apiKey: ENOKI_API_KEY,
      network: SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet',
    });

    // Initialize Sui Client
    const rpcUrl = (() => {
      switch (SUI_NETWORK) {
        case 'mainnet':
          return 'https://fullnode.mainnet.sui.io';
        case 'testnet':
          return 'https://fullnode.testnet.sui.io';
        case 'devnet':
          return 'https://fullnode.devnet.sui.io';
        default:
          return 'https://fullnode.testnet.sui.io'; // Changed from devnet to testnet
      }
    })();
    
    this.suiClient = new SuiClient({ url: rpcUrl });
  }

  async authenticate(provider: string): Promise<User> {
    try {
      console.log('🚀 Starting Enoki authentication for provider:', provider);
      
      // Create authorization URL using Enoki
      const authUrl = await this.enokiFlow.createAuthorizationURL({
        provider: provider as 'google' | 'facebook' | 'twitch',
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        redirectUrl: window.location.origin,
        extraParams: {
          scope: 'openid email profile',
        },
      });

      console.log('🔗 Auth URL created:', authUrl);

      // Redirect to OAuth provider
      window.location.href = authUrl;

      // This will never be reached due to redirect
      return {} as User;
    } catch (error) {
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }

  async handleCallback(): Promise<User | null> {
    try {
      console.log('🔄 Handling Enoki callback...');
      
      // Get authorization parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const code = urlParams.get('code');
      const idToken = hashParams.get('id_token');
      const state = urlParams.get('state') || hashParams.get('state');

      console.log('📋 Callback params:', { 
        hasCode: !!code, 
        hasIdToken: !!idToken, 
        hasState: !!state 
      });

      if (!code && !idToken) {
        console.log('❌ No authorization code or ID token found');
        return null;
      }

      // Handle the auth callback with Enoki
      const result = await this.enokiFlow.handleAuthCallback({
        authorizationCode: code || undefined,
        idToken: idToken || undefined,
      });

      console.log('✅ Enoki callback result:', result);

      // Extract user information
      const user: User = {
        address: result.address,
        provider: result.provider || 'google',
        email: result.claims?.email || '',
        name: result.claims?.name || result.claims?.given_name || 'Unknown User',
      };

      // Clear URL parameters
      window.history.replaceState(null, '', window.location.pathname);

      console.log('👤 User created:', user);
      return user;

    } catch (error) {
      console.error('❌ Callback handling error:', error);
      return null;
    }
  }

  // Get current Enoki session
  async getCurrentSession() {
    try {
      const session = await this.enokiFlow.getSession();
      console.log('📱 Current session:', session);
      return session;
    } catch (error) {
      console.error('❌ Failed to get session:', error);
      return null;
    }
  }

  // Sign out from Enoki
  async signOut() {
    try {
      await this.enokiFlow.logout();
      console.log('👋 Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  // Execute transaction using Enoki (for future credential operations)
  async executeTransaction(transactionData: any) {
    try {
      const session = await this.getCurrentSession();
      if (!session) {
        throw new Error('No active session for transaction');
      }

      // Use Enoki to sponsor and execute transaction
      const result = await this.enokiFlow.sponsorAndExecuteTransactionBlock({
        transactionBlock: transactionData,
      });

      console.log('📝 Transaction executed:', result);
      return result;
    } catch (error) {
      console.error('❌ Transaction error:', error);
      throw error;
    }
  }
}

export const zkLoginService = new ZkLoginService();
