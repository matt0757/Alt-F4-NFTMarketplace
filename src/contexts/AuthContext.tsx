import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useConnectWallet, useDisconnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet, type EnokiWallet, AuthProvider as EnokiAuthProvider } from '@mysten/enoki';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (provider: string) => Promise<void>;
  logout: () => void;
  credentials: any[];
  addCredential: (credential: any) => void;
  removeCredential: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any[]>([]);
  
  // Use Enoki hooks
  const currentAccount = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets().filter(isEnokiWallet);
  
  const walletsByProvider = wallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<EnokiAuthProvider, EnokiWallet>(),
  );

  // Convert currentAccount to User format
  const user: User | null = currentAccount ? {
    id: currentAccount.address,
    email: 'user@example.com',
    name: 'Enoki User',
    address: currentAccount.address,
  } : null;

  const login = async (provider: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Available wallets:', wallets.map(w => w.provider));
      console.log('🔍 Wallets by provider:', Array.from(walletsByProvider.keys()));
      
      if (wallets.length === 0) {
        throw new Error('No Enoki wallets available. Make sure VITE_GOOGLE_CLIENT_ID is set in your .env file and Enoki wallets are registered.');
      }
      
      const wallet = walletsByProvider.get(provider as EnokiAuthProvider);
      if (!wallet) {
        throw new Error(`No wallet found for provider: ${provider}. Available: ${Array.from(walletsByProvider.keys()).join(', ')}`);
      }
      
      connect({ wallet });
      
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // Disconnect the current wallet
      disconnect();
      
      // Clear any local state
      setError(null);
      setCredentials([]);
      
      // Clear localStorage (where Enoki might store session data)
      localStorage.clear();
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      // Force page reload to ensure complete cleanup
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      console.log('✅ User logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Logout failed');
    }
  };

  const addCredential = (credential: any) => {
    const newCredential = {
      ...credential,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCredentials(prev => [...prev, newCredential]);
  };

  const removeCredential = (id: string) => {
    setCredentials(prev => prev.filter(cred => cred.id !== id));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      credentials,
      addCredential,
      removeCredential,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
