import React, { useEffect, useState, useRef } from 'react';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { ShoppingCart, Tag, Plus, Package, User, RefreshCw, TestTube, Copy } from 'lucide-react';
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
    purchaseItem,
    testTransaction
  } = useMarketplace();
  
  const currentAccount = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-nfts'>('marketplace');
  const [testLoading, setTestLoading] = useState(false);
  
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

  const handleTestTransaction = async () => {
    try {
      setTestLoading(true);
      console.log('🧪 Testing transaction system...');
      const wrappedExecute = async (tx: any) => {
        return new Promise((resolve, reject) => {
          signAndExecute(
            { transaction: tx },
            {
              onSuccess: resolve,
              onError: reject,
            }
          );
        });
      };
      await marketplaceService.testTransaction(wrappedExecute);
      console.log('✅ Transaction system is working!');
    } catch (error) {
      console.error('❌ Transaction test failed:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const copyAddressToClipboard = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address);
      alert(`✅ Wallet address copied to clipboard!\n\n${currentAccount.address}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">NFT Marketplace</h1>
            <p className="text-gray-400">Discover and trade unique digital assets</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyAddressToClipboard}
              className="glass-button p-3 rounded-lg hover:bg-blue-500/20 transition-colors"
              title="Copy wallet address"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={handleTestTransaction}
              disabled={testLoading}
              className="glass-button p-3 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
              title="Test transaction system"
            >
              <TestTube className={`w-5 h-5 ${testLoading ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="glass-button p-3 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{listings.length}</p>
                <p className="text-gray-400">Marketplace Listings</p>
              </div>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{userNFTs.length}</p>
                <p className="text-gray-400">Owned NFTs</p>
              </div>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{userListedNFTs.length}</p>
                <p className="text-gray-400">Listed for Sale</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 glass rounded-lg p-1">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'marketplace'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            Marketplace ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('my-nfts')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'my-nfts'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            My NFTs ({userNFTs.length + userListedNFTs.length})
          </button>
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

        {/* Content */}
        {activeTab === 'marketplace' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Marketplace Listings</h2>
            
            {listings.length === 0 && !loading ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items for sale</h3>
                <p className="text-gray-400">Check back later for new listings!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing.itemId} className="glass rounded-xl overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      {listing.imageUrl ? (
                        <img 
                          src={listing.imageUrl} 
                          alt={listing.name || 'NFT'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    
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
      </div>
    </div>
  );
};

export default MarketplaceDashboard;
