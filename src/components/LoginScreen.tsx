import React, { useState } from 'react';
import { Shield, Chrome, Loader2, AlertCircle, Lock, Zap } from 'lucide-react';
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
            <div className="relative inline-block mb-6">
              <Shield className="w-20 h-20 text-blue-400 mx-auto" />
              <div className="absolute inset-0 w-20 h-20 bg-blue-400 blur-xl opacity-50 animate-pulse" />
            </div>
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

          <div className="mt-8 pt-6 border-t border-gray-800">
            <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Secure Session Management</span>
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start space-x-3">
                <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Sessions expire after 24 hours for security</span>
              </li>
              <li className="flex items-start space-x-3">
                <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Authentication required on browser restart</span>
              </li>
              <li className="flex items-start space-x-3">
                <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Zero-knowledge cryptographic proofs</span>
              </li>
              <li className="flex items-start space-x-3">
                <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>No wallet management or seed phrases</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
