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
  loading: boolean;
  error: string | null;
  refreshListings: () => Promise<void>;
  refreshUserNFTs: () => Promise<void>;
  listItem: (itemId: string, price: number) => Promise<void>;
  purchaseItem: (itemId: string, price: number) => Promise<void>;
  mintNFT: (name: string, description: string, imageUrl: string) => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFTObject[]>([]);
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
      await marketplaceService.listItem(
        currentAccount.address,
        itemId,
        price,
        signAndExecute
      );
      // Only refresh after successful transaction
      await Promise.all([refreshListings(), refreshUserNFTs()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentAccount, signAndExecute, refreshListings, refreshUserNFTs]);

  const purchaseItem = useCallback(async (itemId: string, price: number) => {
    if (!currentAccount) throw new Error('No account connected');
    
    try {
      setLoading(true);
      await marketplaceService.purchaseItem(itemId, price, signAndExecute);
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
      
      const result = await marketplaceService.mintNFT(name, description, imageUrl, signAndExecute);
      console.log('✅ Mint result:', result);
      
      // Wait longer for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Only refresh user NFTs after successful mint
      await refreshUserNFTs();
      
    } catch (err) {
      console.error('❌ Mint error:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentAccount, signAndExecute, refreshUserNFTs]);

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
      loading,
      error,
      refreshListings,
      refreshUserNFTs,
      listItem,
      purchaseItem,
      mintNFT,
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
