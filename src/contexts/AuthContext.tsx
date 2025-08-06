import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useWallets, useConnectWallet, useCurrentWallet, useCurrentAccount } from '@mysten/dapp-kit';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  address?: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any[]>([]);

  const wallets = useWallets();
  const { mutate: connectWallet } = useConnectWallet();
  const { currentWallet, isConnected } = useCurrentWallet();
  const currentAccount = useCurrentAccount();

  const login = async (provider: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find the Enoki wallet for the specified provider
      const enokiWallet = wallets.find(wallet => 
        wallet.name.toLowerCase().includes(provider.toLowerCase())
      );
      
      if (!enokiWallet) {
        throw new Error(`${provider} wallet not found`);
      }

      // Connect to the Enoki wallet
      connectWallet(
        { wallet: enokiWallet },
        {
          onSuccess: () => {
            console.log('✅ Wallet connected successfully');
            // Set user with the actual wallet address
            if (currentAccount) {
              setUser({
                id: currentAccount.address,
                email: 'user@example.com', // You might get this from the OAuth response
                name: 'User', // You might get this from the OAuth response
                address: currentAccount.address,
              });
            }
          },
          onError: (error) => {
            console.error('❌ Wallet connection failed:', error);
            setError('Failed to connect wallet');
          },
        }
      );
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Update user when account changes
  React.useEffect(() => {
    if (currentAccount && isConnected) {
      setUser({
        id: currentAccount.address,
        email: 'user@example.com',
        name: 'User',
        address: currentAccount.address,
      });
    } else {
      setUser(null);
    }
  }, [currentAccount, isConnected]);

  const logout = () => {
    setUser(null);
    setError(null);
    // The wallet disconnection is handled by the WalletProvider
  };

  const addCredential = (credential: any) => {
    setCredentials(prev => [...prev, credential]);
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
