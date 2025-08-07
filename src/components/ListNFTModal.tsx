import React, { useState } from 'react';
import { X, Tag, Loader } from 'lucide-react';
import { useMarketplace } from '../contexts/MarketplaceContext';

interface ListNFTModalProps {
  nft: {
    objectId: string;
    name: string;
    description: string;
    imageUrl: string;
  };
  onClose: () => void;
}

const ListNFTModal: React.FC<ListNFTModalProps> = ({ nft, onClose }) => {
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { listItem } = useMarketplace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || parseFloat(price) <= 0) return;

    try {
      setIsLoading(true);
      await listItem(nft.objectId, parseFloat(price));
      onClose();
    } catch (error) {
      console.error('Failed to list NFT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-dark rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">List NFT for Sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NFT Preview */}
        <div className="mb-6">
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center overflow-hidden">
                {nft.imageUrl ? (
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Tag className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{nft.name}</h3>
                <p className="text-sm text-gray-400 truncate">{nft.description}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sale Price (SUI)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0.01"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum price: 0.01 SUI
            </p>
          </div>

          {price && parseFloat(price) > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">You will receive:</span>
                <span className="font-semibold">{parseFloat(price).toFixed(2)} SUI</span>
              </div>
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
              disabled={isLoading || !price || parseFloat(price) <= 0}
              className="flex-1 glass-button disabled:opacity-50 disabled:cursor-not-allowed py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Tag className="w-4 h-4 mr-2" />
                  List for Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListNFTModal;
