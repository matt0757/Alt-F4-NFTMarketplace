import React, { useEffect, useState, useRef } from 'react';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { ShoppingCart, Tag, Plus, Package, User, RefreshCw, Copy } from 'lucide-react';
import CreateNFTModal from './CreateNFTModal';
import ListNFTModal from './ListNFTModal';
import { MarketplaceService } from '../services/marketplaceService';
import { useSuiClient } from '@mysten/dapp-kit';

const MarketplaceDashboard: React.FC = () => {
  const { 
    listings, 
    userNFTs, 
    userListedNFTs,
    loading, 
    error, 
    refreshListings, 
    refreshUserNFTs, 
    purchaseItem
  } = useMarketplace();
  
  const currentAccount = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-nfts'>('marketplace');
  const [showCopyToast, setShowCopyToast] = useState(false);
  
  // Use ref to track if initial load has happened
  const initialLoadRef = useRef(false);
  const marketplaceService = new MarketplaceService(client);

  // Only do initial load once when component mounts
  useEffect(() => {
    if (!initialLoadRef.current && currentAccount) {
      console.log('🎯 MarketplaceDashboard initial load...');
      initialLoadRef.current = true;
      
      // Small delay to prevent rapid API calls
      const timer = setTimeout(() => {
        refreshListings();
        refreshUserNFTs();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentAccount]); // Don't include refresh functions in dependencies

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

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await Promise.all([refreshListings(), refreshUserNFTs()]);
  };

  const copyAddressToClipboard = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address);
      setShowCopyToast(true);
      // Auto-hide after 2.5 seconds
      setTimeout(() => setShowCopyToast(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-xl"></div>
          <div className="relative glass p-6 rounded-2xl border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  NFT Marketplace
                </h1>
                <p className="text-gray-400">Discover, create, and trade unique digital assets</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={copyAddressToClipboard}
                  className="group relative glass-button p-3 rounded-xl hover:bg-blue-500/20 transition-all duration-300 hover:scale-105"
                  title="Copy wallet address"
                >
                  <Copy className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full opacity-75 animate-pulse"></div>
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="group glass-button p-3 rounded-xl hover:bg-purple-500/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <RefreshCw className={`w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative glass p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">{listings.length}</p>
                    <p className="text-blue-300/70 text-sm">Marketplace Listings</p>
                  </div>
                </div>
                <div className="text-3xl text-blue-500/30">📦</div>
              </div>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative glass p-6 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                    <User className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">{userNFTs.length}</p>
                    <p className="text-green-300/70 text-sm">Owned NFTs</p>
                  </div>
                </div>
                <div className="text-3xl text-green-500/30">👤</div>
              </div>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative glass p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <Tag className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">{userListedNFTs.length}</p>
                    <p className="text-purple-300/70 text-sm">Listed for Sale</p>
                  </div>
                </div>
                <div className="text-3xl text-purple-500/30">🏷️</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="relative mb-8">
          <div className="glass rounded-2xl p-2 border border-white/10">
            <div className="flex relative">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`relative flex-1 py-3 px-6 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === 'marketplace'
                    ? 'text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === 'marketplace' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-90"></div>
                )}
                <div className="relative flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Marketplace
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === 'marketplace' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {listings.length}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('my-nfts')}
                className={`relative flex-1 py-3 px-6 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === 'my-nfts'
                    ? 'text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === 'my-nfts' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-purple-500 rounded-xl opacity-90"></div>
                )}
                <div className="relative flex items-center justify-center">
                  <User className="w-5 h-5 mr-2" />
                  My NFTs
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === 'my-nfts' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {userNFTs.length + userListedNFTs.length}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
            {error}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-4 text-sm underline hover:no-underline"
            >
              Refresh Page
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        )}

        {/* Enhanced Marketplace Content */}
        {activeTab === 'marketplace' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Marketplace Listings
              </h2>
              <div className="text-sm text-gray-400">
                {listings.length} {listings.length === 1 ? 'item' : 'items'} available
              </div>
            </div>
            
            {listings.length === 0 && !loading ? (
              <div className="text-center py-20">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-2xl"></div>
                  <div className="relative glass p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-300">No items for sale</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  The marketplace is waiting for its first listings. Create an NFT and be the first to list!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, index) => (
                  <div 
                    key={listing.itemId} 
                    className="group relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative glass rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                      <div className="relative h-56 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 overflow-hidden">
                        {listing.imageUrl ? (
                          <img 
                            src={listing.imageUrl} 
                            alt={listing.name || 'NFT'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-400 opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <div className="glass px-3 py-1 rounded-full border border-white/20">
                            <span className="text-xs font-medium text-white">#{listing.itemId.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors">
                          {listing.name || `NFT #${listing.itemId.slice(0, 8)}`}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {listing.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Price</span>
                            <div className="flex items-center">
                              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                {(listing.price / 1e9).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-400 ml-1">SUI</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Seller</span>
                            <p className="text-sm font-mono text-gray-300 bg-gray-800/50 px-2 py-1 rounded mt-1">
                              {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                            </p>
                          </div>
                        </div>

                        {currentAccount?.address === listing.seller ? (
                          <div className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 py-3 px-4 rounded-xl text-center font-medium">
                            🏷️ Your Listing
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchase(listing.itemId, listing.price)}
                            disabled={purchaseLoading === listing.itemId}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:scale-100 flex items-center justify-center shadow-lg"
                          >
                            {purchaseLoading === listing.itemId ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <>
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Buy Now
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-nfts' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Your NFT Collection</h2>
            
            {/* Owned NFTs Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-blue-400">
                <Package className="w-5 h-5 inline mr-2" />
                Owned NFTs ({userNFTs.length})
              </h3>
              
              {userNFTs.length === 0 ? (
                <div className="text-center py-8 glass rounded-xl">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No owned NFTs</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userNFTs.map((nft) => (
                    <div key={nft.objectId} className="glass rounded-xl overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                        {nft.imageUrl ? (
                          <img 
                            src={nft.imageUrl} 
                            alt={nft.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-2">{nft.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{nft.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-400">Token ID</p>
                            <p className="text-sm font-mono">{nft.objectId.slice(0, 8)}...</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-400">✓ Owned</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleListNFT(nft)}
                          className="w-full glass-button hover:bg-purple-500/20 transition-colors py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          List for Sale
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Listed NFTs Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-purple-400">
                <Tag className="w-5 h-5 inline mr-2" />
                Listed for Sale ({userListedNFTs.length})
              </h3>
              
              {userListedNFTs.length === 0 ? (
                <div className="text-center py-8 glass rounded-xl">
                  <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No NFTs listed for sale</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userListedNFTs.map((nft) => (
                    <div key={nft.objectId} className="glass rounded-xl overflow-hidden border border-purple-500/30">
                      <div className="h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        {nft.imageUrl ? (
                          <img 
                            src={nft.imageUrl} 
                            alt={nft.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-2">{nft.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{nft.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-400">Token ID</p>
                            <p className="text-sm font-mono">{nft.objectId.slice(0, 8)}...</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Listed for</p>
                            <p className="text-sm font-bold text-purple-400">{nft.price} SUI</p>
                          </div>
                        </div>

                        <button 
                          disabled 
                          className="w-full bg-purple-600/20 text-purple-400 py-2 px-4 rounded-lg cursor-not-allowed border border-purple-500/30"
                        >
                          Listed on Marketplace
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Empty state when no NFTs at all */}
            {userNFTs.length === 0 && userListedNFTs.length === 0 && !loading && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No NFTs yet</h3>
                <p className="text-gray-400">Create your first NFT to get started!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 glass-button px-6 py-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Create NFT
                </button>
              </div>
            )}
          </div>
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

        {/* Enhanced Copy Toast Notification */}
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
          showCopyToast 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
        }`}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl blur"></div>
            <div className="relative glass px-8 py-4 rounded-2xl border border-green-500/30 bg-green-500/10 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                  <Copy className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-green-300">Address Copied!</p>
                  <p className="text-xs text-green-400/70">Wallet address saved to clipboard</p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDashboard;
