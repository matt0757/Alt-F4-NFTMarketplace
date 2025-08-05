import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Credential } from '../types';

interface CredentialFormProps {
  onSubmit: (credential: Omit<Credential, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const CredentialForm: React.FC<CredentialFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && value) {
      onSubmit({ title, description, value });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      
      <div className="relative glass rounded-2xl p-6 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-xl font-semibold">Add New Credential</h3>
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/80 text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full glass rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="e.g., API Key"
              required
            />
          </div>

          <div>
            <label className="text-white/80 text-sm font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full glass rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="e.g., Production API key for service X"
            />
          </div>

          <div>
            <label className="text-white/80 text-sm font-medium">Value</label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 w-full glass rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 font-mono text-sm"
              placeholder="Enter your credential value"
              rows={3}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 glass-button rounded-lg px-4 py-2 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 glass-button rounded-lg px-4 py-2 text-white flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Credential</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialForm;
