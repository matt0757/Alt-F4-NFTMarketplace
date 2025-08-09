import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConnectWallet, useDisconnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet, type EnokiWallet, AuthProvider as EnokiAuthProvider } from '@mysten/enoki';
import { SESSION_CONFIG } from '../config/session';

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
  isSessionValid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use Enoki hooks
  const currentAccount = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets().filter(isEnokiWallet);
  
  const walletsByProvider = wallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<EnokiAuthProvider, EnokiWallet>(),
  );

  // Check session validity
  const checkSession = () => {
    const sessionData = localStorage.getItem(SESSION_CONFIG.KEYS.SESSION);
    const lastActivity = localStorage.getItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY);
    
    if (!sessionData || !lastActivity) {
      return false;
    }
    
    const lastActivityTime = parseInt(lastActivity);
    const now = Date.now();
    
    // Check if session has expired
    if (now - lastActivityTime > SESSION_CONFIG.TIMEOUT) {
      // Session expired, clear storage
      localStorage.removeItem(SESSION_CONFIG.KEYS.SESSION);
      localStorage.removeItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY);
      return false;
    }
    
    // Update last activity
    localStorage.setItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY, now.toString());
    return true;
  };

  // Initialize session check
  useEffect(() => {
    const isValid = checkSession();
    setIsSessionValid(isValid);
    setIsInitialized(true);
    
    if (!isValid && currentAccount) {
      // If session is invalid but wallet is connected, disconnect
      disconnect();
    }
  }, []);

  // Track user activity to update session
  useEffect(() => {
    if (isSessionValid && currentAccount) {
      const updateActivity = () => {
        localStorage.setItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY, Date.now().toString());
      };

      // Update activity on user interactions
      SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
        document.addEventListener(event, updateActivity, true);
      });

      return () => {
        SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
          document.removeEventListener(event, updateActivity, true);
        });
      };
    }
  }, [isSessionValid, currentAccount]);

  // Convert currentAccount to User format, but only if session is valid
  const user: User | null = (currentAccount && isSessionValid) ? {
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
      
      // Set session data on successful login
      const now = Date.now();
      localStorage.setItem(SESSION_CONFIG.KEYS.SESSION, 'active');
      localStorage.setItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY, now.toString());
      setIsSessionValid(true);
      
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
      
      // Clear session data
      localStorage.removeItem(SESSION_CONFIG.KEYS.SESSION);
      localStorage.removeItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY);
      setIsSessionValid(false);
      
      // Clear any local state
      setError(null);
      setCredentials([]);
      
      // Clear localStorage (where Enoki might store other session data)
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
      loading: loading || !isInitialized,
      error,
      login,
      logout,
      credentials,
      addCredential,
      removeCredential,
      isSessionValid,
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
