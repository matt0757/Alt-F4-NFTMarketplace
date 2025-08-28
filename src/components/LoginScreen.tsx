import React, { useState } from 'react';
import { Chrome, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const handleLogin = async (provider: string) => {
    setLoading(true);
    try {
      await login(provider);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-2xl border border-blue-500/20 neon-glow">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2 gradient-text">NFT Marketplace</h2>
            <p className="text-gray-400">
              Secure authentication for digital asset trading
            </p>
          </div>

          {error && (
            <div className="glass-dark bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleLogin('google')}
              disabled={loading}
              className="w-full glass-button rounded-lg px-6 py-4 text-white font-medium flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Chrome className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
