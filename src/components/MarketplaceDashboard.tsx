import React, { useEffect, useState, useRef } from 'react';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { ShoppingCart, Tag, Plus, Package, User, RefreshCw, Copy, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col w-full overflow-hidden px-6 md:px-10 lg:px-16">
      {/* Display copy toast */}
      {showCopyToast && (
        <div className="fixed top-5 right-5 z-50 animate-fadeIn glass-dark py-3 px-5 rounded-xl flex items-center">
          <div className="bg-green-500/20 p-1.5 rounded-lg mr-3">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-gray-200">Address copied to clipboard</span>
        </div>
      )}

      {/* Header with account info */}
      <div className="relative glass-dark px-6 py-5 rounded-2xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-100">Connected Wallet</h2>
              <div className="flex items-center mt-1">
                <p className="text-gray-400 text-sm font-mono">
                  {currentAccount?.address?.slice(0, 6)}...{currentAccount?.address?.slice(-4)}
                </p>
                <button
                  onClick={copyAddressToClipboard}
                  className="ml-2 bg-gray-700/30 p-1 rounded-md hover:bg-gray-700/50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="glass-button px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="glass-button bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/40 px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create NFT
            </button>
          </div>
        </div>
      </div>

      {/* Premium Tab Navigation with enhanced glass effect and animations */}
      <div className="relative mb-8 animate-fadeIn">
        <div className="glass-tab-container rounded-2xl p-2.5 shadow-2xl backdrop-blur-2xl">
          <div className="flex relative">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`glass-tab relative flex-1 py-4 px-6 rounded-xl transition-all duration-500 font-medium ${
                activeTab === 'marketplace'
                  ? 'glass-tab-active text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'marketplace' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 rounded-xl opacity-90"></div>
                  <div className="glass-tab-indicator"></div>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center z-10">
                <div className={`p-1.5 rounded-lg mr-3 ${activeTab === 'marketplace' ? 'bg-white/10' : 'bg-blue-500/10'} backdrop-blur`}>
                  <ShoppingCart className={`w-5 h-5 ${activeTab === 'marketplace' ? 'text-white' : 'text-blue-400'}`} />
                </div>
                <span className="font-semibold tracking-wide text-shadow-sm">Marketplace</span>
                <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeTab === 'marketplace' 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {listings.length}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('my-nfts')}
              className={`glass-tab relative flex-1 py-4 px-6 rounded-xl transition-all duration-500 font-medium ${
                activeTab === 'my-nfts'
                  ? 'glass-tab-active text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'my-nfts' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-teal-600/90 to-blue-600/90 rounded-xl opacity-90"></div>
                  <div className="glass-tab-indicator"></div>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-teal-600/10 to-blue-600/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center z-10">
                <div className={`p-1.5 rounded-lg mr-3 ${activeTab === 'my-nfts' ? 'bg-white/10' : 'bg-green-500/10'} backdrop-blur`}>
                  <User className={`w-5 h-5 ${activeTab === 'my-nfts' ? 'text-white' : 'text-green-400'}`} />
                </div>
                <span className="font-semibold tracking-wide text-shadow-sm">My NFTs</span>
                <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeTab === 'my-nfts' 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {userNFTs.length + userListedNFTs.length}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Premium Error Display */}
      {error && (
        <div className="relative overflow-hidden mb-8 animate-fadeIn">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/10 rounded-xl blur-xl"></div>
          <div className="relative glass-dark border border-red-500/30 p-6 rounded-xl shadow-[0_10px_30px_rgba(239,68,68,0.3)]">
            <div className="flex items-start">
              <div className="p-2.5 bg-red-500/20 rounded-xl mr-5 backdrop-blur">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-300 mb-2 text-shadow-sm">Error Occurred</h3>
                <p className="text-red-200/70 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="glass-button bg-red-500/20 text-red-300 border-red-500/30 py-2 px-4 rounded-lg text-sm font-medium inline-flex items-center hover:bg-red-500/30 hover:scale-105 hover:shadow-[0_5px_15px_rgba(239,68,68,0.4)] transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Loading State */}
      {loading && (
        <div className="text-center py-12 animate-fadeIn">
          <div className="relative inline-flex">
            <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl"></div>
            <div className="absolute w-16 h-16 rounded-full border-4 border-blue-500/10 border-t-blue-500/80 animate-spin"></div>
            <div className="w-16 h-16 rounded-full border-4 border-transparent border-r-indigo-500/80 animate-[spin_1.2s_linear_infinite]"></div>
            <div className="absolute w-12 h-12 rounded-full border-4 border-transparent border-b-purple-500/80 animate-[spin_2s_linear_infinite]"></div>
            <div className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-md animate-pulse"></div>
          </div>
          <p className="text-lg text-blue-300 font-medium mt-8 text-shadow-sm">Loading Marketplace Data...</p>
          <p className="text-gray-400 mt-2 max-w-md mx-auto">Please wait while we fetch the latest NFTs from the blockchain</p>
        </div>
      )}

      {/* Enhanced Marketplace Content with Premium Header */}
      {activeTab === 'marketplace' && (
        <div>
          <div className="flex items-center justify-between mb-8 glass-card p-6 rounded-2xl">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent text-shadow-sm mb-2">
                Marketplace Listings
              </h2>
              <p className="text-blue-100/70 text-sm">
                {listings.length} {listings.length === 1 ? 'item' : 'items'} available for purchase
              </p>
            </div>
            <div className="flex space-x-4">
              <button onClick={handleRefresh} className="glass-button bg-blue-500/10 border-blue-500/40 text-blue-300 py-2.5 px-5 rounded-xl text-sm font-medium flex items-center hover:bg-blue-500/20 hover:scale-105 transition-all duration-300 shadow-lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* No listings state */}
          {listings.length === 0 && !loading ? (
            <div className="glass-dark rounded-xl p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Package className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No NFTs Listed Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Be the first to list your NFT on the marketplace or create a new one!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="glass-button bg-indigo-500/20 border-indigo-500/40 text-indigo-300 py-2.5 px-6 rounded-xl text-sm font-medium inline-flex items-center hover:bg-indigo-500/30 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create NFT
              </button>
            </div>
          ) : (
            /* NFT Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
              {listings.map((item) => (
                <div key={item.itemId} className="glass-card rounded-xl overflow-hidden flex flex-col card-hover">
                  {/* NFT Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name || 'NFT'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                        <Package className="w-16 h-16 text-blue-300/40" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="glass-dark py-1 px-3 rounded-full shadow-lg text-xs font-medium text-blue-300 flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {item.price} SUI
                      </div>
                    </div>
                  </div>
                  
                  {/* NFT Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-white mb-1 truncate">
                      {item.name || `NFT #${item.itemId.slice(0, 8)}`}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                      {item.description || 'No description provided for this NFT.'}
                    </p>
                    
                    <div className="mt-auto">
                      <button
                        onClick={() => handlePurchase(item.itemId, item.price)}
                        disabled={!!purchaseLoading}
                        className={`w-full glass-button py-3 rounded-lg font-medium flex items-center justify-center ${
                          purchaseLoading === item.itemId
                            ? 'bg-indigo-500/10 text-indigo-300/50'
                            : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:scale-[1.02]'
                        } transition-all duration-300`}
                      >
                        {purchaseLoading === item.itemId ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-400/20 border-t-indigo-400 animate-spin mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Purchase NFT
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My NFTs Tab */}
      {activeTab === 'my-nfts' && (
        <div>
          <div className="flex items-center justify-between mb-8 glass-card p-6 rounded-2xl">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 bg-clip-text text-transparent text-shadow-sm mb-2">
                My NFT Collection
              </h2>
              <p className="text-blue-100/70 text-sm">
                {userNFTs.length + userListedNFTs.length} {userNFTs.length + userListedNFTs.length === 1 ? 'NFT' : 'NFTs'} in your collection
              </p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="glass-button bg-green-500/10 border-green-500/40 text-green-300 py-2.5 px-5 rounded-xl text-sm font-medium flex items-center hover:bg-green-500/20 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create NFT
              </button>
            </div>
          </div>

          {/* Section for unlisted NFTs */}
          {userNFTs.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-white mb-5 pl-1">Available to List ({userNFTs.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {userNFTs.map((nft) => (
                  <div key={nft.objectId} className="glass-card rounded-xl overflow-hidden flex flex-col card-hover">
                    {/* NFT Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
                      {nft.imageUrl ? (
                        <img
                          src={nft.imageUrl}
                          alt={nft.name || 'NFT'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-900/20 to-blue-900/20 flex items-center justify-center">
                          <Package className="w-16 h-16 text-green-300/40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <div className="glass-dark py-1 px-3 rounded-full shadow-lg text-xs font-medium text-green-300 flex items-center">
                          Available
                        </div>
                      </div>
                    </div>
                    
                    {/* NFT Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg text-white mb-1 truncate">
                        {nft.name || `NFT #${nft.objectId.slice(0, 8)}`}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                        {nft.description || 'No description provided for this NFT.'}
                      </p>
                      
                      <div className="mt-auto">
                        <button
                          onClick={() => handleListNFT(nft)}
                          className="w-full glass-button bg-green-500/20 text-green-300 border-green-500/40 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-green-500/30 hover:scale-[1.02] transition-all duration-300"
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          List for Sale
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section for listed NFTs */}
          {userListedNFTs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-5 pl-1">Currently Listed ({userListedNFTs.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {userListedNFTs.map((nft) => (
                  <div key={nft.objectId} className="glass-card rounded-xl overflow-hidden flex flex-col card-hover border border-blue-500/30">
                    {/* NFT Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                      {nft.imageUrl ? (
                        <img
                          src={nft.imageUrl}
                          alt={nft.name || 'NFT'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                          <Package className="w-16 h-16 text-blue-300/40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <div className="glass-dark py-1 px-3 rounded-full shadow-lg text-xs font-medium text-blue-300 flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          Listed
                        </div>
                      </div>
                    </div>
                    
                    {/* NFT Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg text-white mb-1 truncate">
                        {nft.name || `NFT #${nft.objectId.slice(0, 8)}`}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                        {nft.description || 'No description provided for this NFT.'}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="text-sm text-gray-400 mb-3 flex items-center justify-center py-1 px-3 bg-blue-500/10 rounded-lg">
                          Listed for sale on marketplace
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No NFTs state */}
          {userNFTs.length === 0 && userListedNFTs.length === 0 && !loading && (
            <div className="glass-dark rounded-xl p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-green-500/10 flex items-center justify-center">
                <User className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Your Collection is Empty</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Start building your NFT collection by creating your first NFT!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="glass-button bg-green-500/20 border-green-500/40 text-green-300 py-2.5 px-6 rounded-xl text-sm font-medium inline-flex items-center hover:bg-green-500/30 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create NFT
              </button>
            </div>
          )}
        </div>
      )}

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
  );
};

export default MarketplaceDashboard;
