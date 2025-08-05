import React, { useState } from 'react';
import { Shield, Chrome, Loader2, AlertCircle, Lock, Zap } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (provider: string) => Promise<void>;
  error: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider: string) => {
    setLoading(true);
    try {
      await onLogin(provider);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-2xl p-8 shadow-2xl border border-blue-500/20 neon-glow">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <Shield className="w-20 h-20 text-blue-400 mx-auto" />
            <div className="absolute inset-0 w-20 h-20 bg-blue-400 blur-xl opacity-50 animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold mb-2 gradient-text">zkLogin Vault</h2>
          <p className="text-gray-400">
            Decentralized authentication for the blockchain era
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
            <span>Zero-Knowledge Architecture</span>
          </h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex items-start space-x-3">
              <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Your identity remains private on-chain</span>
            </li>
            <li className="flex items-start space-x-3">
              <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>No wallet management or seed phrases</span>
            </li>
            <li className="flex items-start space-x-3">
              <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Cryptographic proof of authentication</span>
            </li>
            <li className="flex items-start space-x-3">
              <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Enterprise-grade security standards</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
