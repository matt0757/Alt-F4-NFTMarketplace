import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { MarketplaceService, NFTObject } from '../services/marketplaceService';

interface MarketplaceListing {
  itemId: string;
  seller: string;
  price: number;
  timestamp?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
}

interface MarketplaceContextType {
  listings: MarketplaceListing[];
  userNFTs: NFTObject[];
  userListedNFTs: NFTObject[];
  loading: boolean;
  error: string | null;
  refreshListings: () => Promise<void>;
  refreshUserNFTs: () => Promise<void>;
  listItem: (itemId: string, price: number) => Promise<void>;
  purchaseItem: (itemId: string, price: number) => Promise<void>;
  mintNFT: (name: string, description: string, imageUrl: string) => Promise<void>;
  testTransaction: () => Promise<any>;
  requestTestnetSui: () => Promise<boolean>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFTObject[]>([]);
  const [userListedNFTs, setUserListedNFTs] = useState<NFTObject[]>([]); // Track NFTs you've listed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const marketplaceService = new MarketplaceService(client);

  // Debounced refresh function
  const refreshUserNFTs = useCallback(async () => {
    if (!currentAccount) return;
    
    const now = Date.now();
    // Prevent refreshing more than once every 5 seconds
    if (now - lastRefresh < 5000) {
      console.log('⏰ Skipping refresh - too soon');
      return;
    }
    
    try {
      console.log('🔄 Refreshing user NFTs...');
      setLoading(true);
      setError(null);
      setLastRefresh(now);
      
      const nfts = await marketplaceService.getUserNFTs(currentAccount.address);
      setUserNFTs(nfts);
      console.log('✅ User NFTs refreshed:', nfts);

      // Also refresh user listed NFTs
      const listedNFTs = await marketplaceService.getUserListedNFTs(currentAccount.address);
      setUserListedNFTs(listedNFTs);
      console.log('✅ User listed NFTs refreshed:', listedNFTs);
    } catch (err) {
      console.error('❌ Error refreshing user NFTs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user NFTs');
    } finally {
      setLoading(false);
    }
  }, [currentAccount, marketplaceService, lastRefresh]);

  const refreshListings = useCallback(async () => {
    try {
      console.log('🔄 Refreshing marketplace listings...');
      setLoading(true);
      setError(null);
      
      const fetchedListings = await marketplaceService.getListings();
      setListings(fetchedListings);
      console.log('✅ Listings refreshed:', fetchedListings);
    } catch (err) {
      console.error('❌ Error refreshing listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [marketplaceService]);

  const listItem = useCallback(async (itemId: string, price: number) => {
    if (!currentAccount) throw new Error('No account connected');
    
    try {
      setLoading(true);
      
      // Create a wrapper function that properly handles the signAndExecute mutation
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
      
      await marketplaceService.listItem(
        currentAccount.address,
        itemId,
        price,
        wrappedExecute
      );
      
      // Instead of trying to keep it in userNFTs (since we don't own it anymore),
      // move it to userListedNFTs and remove from userNFTs
      console.log('✅ NFT listed successfully! Moving to listed NFTs...');
      console.log('📋 Current userNFTs before update:', userNFTs);
      
      // Find the NFT being listed
      const listedNFT = userNFTs.find(nft => nft.objectId === itemId);
      if (listedNFT) {
        // Remove from userNFTs (since we don't own it anymore)
        setUserNFTs(prev => prev.filter(nft => nft.objectId !== itemId));
        
        // Add to userListedNFTs with price info
        setUserListedNFTs(prev => [...prev, { ...listedNFT, isListed: true, price: price }]);
        
        console.log('✅ NFT moved to listed NFTs');
      }
      
      // Refresh listings to show it in the marketplace
      await refreshListings();
      console.log('✅ Listings refreshed');
      
      console.log('✅ NFT listing completed!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentAccount, signAndExecute, refreshListings]);

  const purchaseItem = useCallback(async (itemId: string, price: number) => {
    if (!currentAccount) throw new Error('No account connected');
    
    try {
      setLoading(true);
      
      // Create a wrapper function that properly handles the signAndExecute mutation
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
      
      await marketplaceService.purchaseItem(itemId, price, wrappedExecute);
      // Only refresh after successful transaction
      await Promise.all([refreshListings(), refreshUserNFTs()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentAccount, signAndExecute, refreshListings, refreshUserNFTs]);

  const mintNFT = useCallback(async (name: string, description: string, imageUrl: string) => {
    if (!currentAccount) throw new Error('No account connected');
    
    try {
      console.log('🎨 Minting NFT:', { name, description, imageUrl });
      setLoading(true);
      setError(null);
      
      // Create a wrapper function that properly handles the signAndExecute mutation
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
      
      const result = await marketplaceService.mintNFT(name, description, imageUrl, wrappedExecute);
      console.log('✅ Mint result:', result);
      
      // If we have a transaction digest, get the NFT directly
      if (result?.digest) {
        console.log('🔍 Transaction successful with digest:', result.digest);
        
        // Try to get the created NFT directly from transaction
        console.log('🎯 Attempting to get NFT from transaction...');
        const newNFT = await marketplaceService.getNFTFromTransaction(result.digest);
        console.log('✅ Found NFT from transaction:', newNFT);
        
        if (newNFT?.objectId) {
          // Add it to the local state immediately
          setUserNFTs(prev => [...prev, newNFT]);
          console.log('✅ NFT added to local state!');
          
          // Try to fetch the full object data directly for better info
          console.log('🔍 Fetching full NFT data directly...');
          const fullNFT = await marketplaceService.getNFTByObjectId(newNFT.objectId);
          
          if (fullNFT) {
            console.log('✅ Got full NFT data:', fullNFT);
            // Update with full data
            setUserNFTs(prev => prev.map(nft => 
              nft.objectId === fullNFT.objectId ? fullNFT : nft
            ));
          }
        }
      }
      
      // Wait longer for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // COMMENTED OUT: This refresh was overwriting the newly created NFT
      // because the blockchain indexer hasn't caught up yet
      // await refreshUserNFTs();
      
      console.log('✅ NFT minting completed! NFT should be visible in your collection.');
      
    } catch (err) {
      console.error('❌ Mint error:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentAccount, signAndExecute, refreshUserNFTs]);

  const testTransaction = useCallback(async () => {
    if (!currentAccount) throw new Error('No account connected');
    
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
    
    return await marketplaceService.testTransaction(wrappedExecute);
  }, [currentAccount, signAndExecute, marketplaceService]);

  const requestTestnetSui = useCallback(async () => {
    if (!currentAccount) throw new Error('No account connected');
    
    return await marketplaceService.requestTestnetSui(currentAccount.address);
  }, [currentAccount, marketplaceService]);

  // Only refresh when account changes (not on every render)
  useEffect(() => {
    let mounted = true;
    
    if (currentAccount?.address && mounted) {
      console.log('👤 Account connected, initial data load...');
      
      // Initial load with delay to prevent rapid calls
      const timer = setTimeout(() => {
        if (mounted) {
          refreshUserNFTs();
          refreshListings();
        }
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        mounted = false;
      };
    }
  }, [currentAccount?.address]); // Only depend on address, not the full object

  return (
    <MarketplaceContext.Provider value={{
      listings,
      userNFTs,
      userListedNFTs,
      loading,
      error,
      refreshListings,
      refreshUserNFTs,
      listItem,
      purchaseItem,
      mintNFT,
      testTransaction,
      requestTestnetSui,
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within MarketplaceProvider');
  }
  return context;
}
