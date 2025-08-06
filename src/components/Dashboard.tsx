import React, { useState } from 'react';
import { User, Credential } from '../types';
import { Shield, Plus, LogOut, Key, Globe, Copy, Eye, EyeOff, Trash2, Check, User as UserIcon, Lock, Database } from 'lucide-react';
import AddCredentialModal from './AddCredentialModal';

interface DashboardProps {
  user: User;
  credentials: Credential[];
  onLogout: () => void;
  onAddCredential: (credential: Omit<Credential, 'id' | 'createdAt'>) => void;
  onRemoveCredential: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  credentials = [], // Add default empty array
  onLogout,
  onAddCredential,
  onRemoveCredential,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="glass rounded-2xl p-8 shadow-2xl border border-blue-500/20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Shield className="w-10 h-10 text-blue-400" />
              <div className="absolute inset-0 w-10 h-10 bg-blue-400 blur-xl opacity-50" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">zkLogin Vault</h1>
              <p className="text-gray-500 text-sm">Decentralized credential management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2 text-gray-300">
                <UserIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{user.name || user.email || 'User'}</span>
              </div>
              <p className="text-gray-500 text-xs font-mono">
                {truncateAddress(user.address)}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="glass-button rounded-lg px-4 py-2 text-white flex items-center space-x-2 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Encrypted Credentials</span>
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="glass-button rounded-lg px-4 py-2 text-white flex items-center space-x-2 neon-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credential</span>
          </button>
        </div>

        {(credentials || []).length === 0 ? (
          <div className="glass-dark rounded-lg p-12 text-center border border-gray-800">
            <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No credentials stored yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="glass-button rounded-lg px-6 py-2 text-white neon-glow"
            >
              Add Your First Credential
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {credentials.map((credential) => (
              <div key={credential.id} className="glass-dark rounded-lg p-6 border border-gray-800 hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1 flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-blue-400" />
                      <span>{credential.title}</span>
                    </h3>
                    {credential.url && (
                      <div className="flex items-center space-x-2 text-gray-500 text-sm">
                        <Globe className="w-4 h-4" />
                        <span>{credential.url}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveCredential(credential.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-gray-800">
                    <span className="text-gray-500 text-sm">Username</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-300 font-mono">{credential.username}</span>
                      <button
                        onClick={() => copyToClipboard(credential.username, `username-${credential.id}`)}
                        className="text-gray-500 hover:text-blue-400 transition-colors"
                      >
                        {copiedField === `username-${credential.id}` ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-gray-800">
                    <span className="text-gray-500 text-sm">Password</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-300 font-mono">
                        {showPasswords[credential.id] ? credential.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(credential.id)}
                        className="text-gray-500 hover:text-blue-400 transition-colors"
                      >
                        {showPasswords[credential.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(credential.password, `password-${credential.id}`)}
                        className="text-gray-500 hover:text-blue-400 transition-colors"
                      >
                        {copiedField === `password-${credential.id}` ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {credential.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <span className="text-gray-500 text-sm">Notes</span>
                      <p className="text-gray-300 text-sm mt-1">{credential.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddCredentialModal
          onAdd={onAddCredential}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
