import React, { useEffect, useState } from 'react';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { ShoppingCart, Tag, Plus, Package, Store, Wallet } from 'lucide-react';
import CreateNFTModal from './CreateNFTModal';
import ListNFTModal from './ListNFTModal';

const MarketplaceDashboard: React.FC = () => {
  const { listings, userNFTs, loading, error, refreshListings, refreshUserNFTs, purchaseItem } = useMarketplace();
  const currentAccount = useCurrentAccount();
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<'marketplace' | 'my-nfts'>('marketplace');

  useEffect(() => {
    refreshListings();
    if (currentAccount) {
      refreshUserNFTs();
    }
  }, [refreshListings, refreshUserNFTs, currentAccount]);

  const handlePurchase = async (itemId: string, price: number) => {
    try {
      setPurchaseLoading(itemId);
      await purchaseItem(itemId, price);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleListNFT = (nft: any) => {
    setSelectedNFT(nft);
    setShowListModal(true);
  };

  if (loading && listings.length === 0 && userNFTs.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const floorPrice = listings.length > 0 ? Math.min(...listings.map(l => l.price / 1e9)) : 0;
  const userListingsCount = listings.filter(l => l.seller === currentAccount?.address).length;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">NFT Marketplace</h1>
          <p className="text-gray-400">Discover and trade unique digital assets</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setCurrentTab('marketplace')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
              currentTab === 'marketplace'
                ? 'bg-blue-500 text-white'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            <Store className="w-5 h-5" />
            Marketplace
          </button>
          <button
            onClick={() => setCurrentTab('my-nfts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
              currentTab === 'my-nfts'
                ? 'bg-blue-500 text-white'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-5 h-5" />
            My NFTs ({userNFTs.length})
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{listings.length}</p>
                <p className="text-gray-400">Total Listings</p>
              </div>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{userListingsCount}</p>
                <p className="text-gray-400">Your Listings</p>
              </div>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {floorPrice > 0 ? `${floorPrice.toFixed(2)} SUI` : 'N/A'}
                </p>
                <p className="text-gray-400">Floor Price</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Content based on active tab */}
        {currentTab === 'marketplace' ? (
          <>
            {/* Marketplace Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.itemId} className="glass rounded-xl overflow-hidden">
                  {/* NFT Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.name || 'NFT'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400" />
                    )}
                    <Package className="w-12 h-12 text-gray-400 hidden" />
                  </div>
                  
                  {/* NFT Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {listing.name || `NFT #${listing.itemId.slice(0, 8)}`}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {listing.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Price</p>
                        <p className="text-xl font-bold">{(listing.price / 1e9).toFixed(2)} SUI</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Seller</p>
                        <p className="text-sm font-mono">
                          {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    {currentAccount?.address === listing.seller ? (
                      <button 
                        disabled 
                        className="w-full bg-gray-600 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Your Listing
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(listing.itemId, listing.price)}
                        disabled={purchaseLoading === listing.itemId}
                        className="w-full glass-button hover:bg-blue-500/20 transition-colors py-2 px-4 rounded-lg flex items-center justify-center"
                      >
                        {purchaseLoading === listing.itemId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Now
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for Marketplace */}
            {listings.length === 0 && !loading && (
              <div className="text-center py-16">
                <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                <p className="text-gray-400">Be the first to list an NFT!</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* User's NFTs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userNFTs.map((nft) => (
                <div key={nft.objectId} className="glass rounded-xl overflow-hidden">
                  {/* NFT Image */}
                  <div className="h-48 bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                    {nft.imageUrl ? (
                      <img
                        src={nft.imageUrl}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400" />
                    )}
                    <Package className="w-12 h-12 text-gray-400 hidden" />
                  </div>
                  
                  {/* NFT Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{nft.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {nft.description || 'No description available'}
                    </p>
                    
                    <button
                      onClick={() => handleListNFT(nft)}
                      className="w-full glass-button hover:bg-green-500/20 transition-colors py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      List for Sale
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for User NFTs */}
            {userNFTs.length === 0 && !loading && (
              <div className="text-center py-16">
                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No NFTs yet</h3>
                <p className="text-gray-400 mb-4">Create your first NFT to get started!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="glass-button px-6 py-3 rounded-lg"
                >
                  Create NFT
                </button>
              </div>
            )}
          </>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 right-8 glass-button p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-10"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Modals */}
        {showCreateModal && (
          <CreateNFTModal onClose={() => setShowCreateModal(false)} />
        )}

        {showListModal && selectedNFT && (
          <ListNFTModal 
            nft={selectedNFT}
            onClose={() => {
              setShowListModal(false);
              setSelectedNFT(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MarketplaceDashboard;
