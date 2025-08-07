import React, { useState } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { useMarketplace } from '../contexts/MarketplaceContext';

interface CreateNFTModalProps {
  onClose: () => void;
}

const CreateNFTModal: React.FC<CreateNFTModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { mintNFT } = useMarketplace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !imageUrl) return;

    try {
      setIsLoading(true);
      await mintNFT(name, description, imageUrl);
      onClose();
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-dark rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Create NFT</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="My Awesome NFT"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:border-blue-500"
              placeholder="Describe your NFT..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/image.png"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use services like Imgur, IPFS, or any direct image URL
            </p>
          </div>

          {imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Preview:</p>
              <img
                src={imageUrl}
                alt="NFT Preview"
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name || !description || !imageUrl}
              className="flex-1 glass-button disabled:opacity-50 disabled:cursor-not-allowed py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                'Create NFT'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNFTModal;
