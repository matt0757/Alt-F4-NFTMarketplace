import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Lock, 
  Database,
  Globe,
  Key,
  Users,
  Server,
  Eye,
  Fingerprint
} from 'lucide-react';

interface LandingPageProps {
  user: User;
  onContinue: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ user, onContinue }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  const features = [
    {
      icon: Lock,
      title: 'Zero-Knowledge Authentication',
      description: 'Your identity remains private while proving authentication cryptographically',
      color: 'text-blue-400'
    },
    {
      icon: Database,
      title: 'Encrypted Storage',
      description: 'All credentials are encrypted client-side before storage',
      color: 'text-purple-400'
    },
    {
      icon: Globe,
      title: 'Decentralized Architecture',
      description: 'Built on Sui blockchain for maximum security and transparency',
      color: 'text-cyan-400'
    },
    {
      icon: Key,
      title: 'No Seed Phrases',
      description: 'Access your vault using familiar OAuth providers',
      color: 'text-green-400'
    }
  ];

  const securityFeatures = [
    'End-to-end encryption',
    'Zero-knowledge proofs',
    'Decentralized storage',
    'Audit trail on blockchain',
    'Multi-factor authentication',
    'No central authority'
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <Shield className="w-24 h-24 text-blue-400 mx-auto animate-pulse" />
            <div className="absolute inset-0 w-24 h-24 bg-blue-400 blur-xl opacity-50 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Welcome back!</h1>
          <p className="text-gray-300 text-lg">
            Initializing your secure vault...
          </p>
          <div className="mt-8">
            <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" 
                   style={{ width: '100%', animation: 'loading 2s ease-in-out' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <Shield className="w-16 h-16 text-blue-400 mx-auto" />
            <div className="absolute inset-0 w-16 h-16 bg-blue-400 blur-xl opacity-50" />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-4">
            zkLogin Credential Vault
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Your decentralized, zero-knowledge credential management solution
          </p>
          
          {/* User Info */}
          <div className="glass rounded-lg p-4 inline-block border border-blue-500/20">
            <div className="flex items-center space-x-3">
              <Fingerprint className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">
                {user.name || user.email || 'Authenticated User'}
              </span>
              <span className="text-gray-500 text-sm font-mono">
                {truncateAddress(user.address)}
              </span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Features Showcase */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              Enterprise-Grade Security
            </h2>
            
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = index === currentStep;
                
                return (
                  <div
                    key={index}
                    className={`glass-dark rounded-lg p-6 border transition-all duration-500 ${
                      isActive 
                        ? 'border-blue-500/50 neon-glow scale-105' 
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-black/50 ${isActive ? 'animate-pulse' : ''}`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                          isActive ? 'text-white' : 'text-gray-300'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Highlights */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              What Makes Us Different
            </h2>
            
            <div className="glass rounded-xl p-8 border border-blue-500/20">
              <div className="grid gap-4 mb-8">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-800 pt-6">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>Security Level</span>
                  <span className="text-green-400 font-semibold">Maximum</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse" 
                       style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark rounded-lg p-6 text-center border border-gray-800">
                <Lock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">256-bit</div>
                <div className="text-gray-400 text-sm">Encryption</div>
              </div>
              <div className="glass-dark rounded-lg p-6 text-center border border-gray-800">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">0ms</div>
                <div className="text-gray-400 text-sm">Login Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass rounded-2xl p-8 border border-blue-500/20 neon-glow max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Secure Your Credentials?
            </h3>
            <p className="text-gray-300 mb-8">
              Access your encrypted vault and start managing your sensitive information 
              with enterprise-grade security powered by blockchain technology.
            </p>
            
            <button
              onClick={onContinue}
              className="glass-button rounded-lg px-8 py-4 text-white font-semibold flex items-center justify-center space-x-3 mx-auto neon-glow hover:scale-105 transition-all duration-300"
            >
              <span>Enter Your Vault</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Zero logs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span>Decentralized</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>No tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;