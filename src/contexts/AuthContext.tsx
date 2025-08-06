import React, { createContext, useContext, useState, useEffect } from 'react';
import { zkLoginService } from '../services/zkLoginService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (provider: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're returning from OAuth callback
        if (window.location.hash.includes('id_token')) {
          const authenticatedUser = await zkLoginService.handleCallback();
          if (authenticatedUser) {
            setUser(authenticatedUser);
            localStorage.setItem('zklogin_user', JSON.stringify(authenticatedUser));
          }
        } else {
          // Check for stored user
          const storedUser = localStorage.getItem('zklogin_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (providerOrUser: string | User) => {
    try {
      setIsLoading(true);
      // If it's already a user object (from callback), just set it
      if (typeof providerOrUser === 'object' && providerOrUser.address) {
        setUser(providerOrUser);
        return;
      }

      // If it's a string (provider name), do the authentication
      if (typeof providerOrUser === 'string') {
        const user = await zkLoginService.authenticate(providerOrUser);
        setUser(user);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zklogin_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
