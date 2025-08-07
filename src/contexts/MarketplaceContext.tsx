import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { MarketplaceService } from '../services/marketplaceService';

interface MarketplaceListing {
  itemId: string;
  seller: string;
  price: number;
  timestamp?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
}

interface UserNFT {
  objectId: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface MarketplaceContextType {
  listings: MarketplaceListing[];
  userNFTs: UserNFT[];
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
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const marketplaceService = new MarketplaceService(client);

  const refreshListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedListings = await marketplaceService.getListings();
      setListings(fetchedListings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserNFTs = useCallback(async () => {
    if (!currentAccount) return;
    
    try {
      setLoading(true);
      setError(null);
      const nfts = await marketplaceService.getUserNFTs(currentAccount.address);
      setUserNFTs(nfts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user NFTs');
    } finally {
      setLoading(false);
    }
  }, [currentAccount]);

  const listItem = useCallback(async (itemId: string, price: number) => {
    if (!currentAccount) throw new Error('No account connected');
    
    try {
      setLoading(true);
      await marketplaceService.listItem(
        currentAccount.address,
        itemId,
        price * 1e9, // Convert to MIST
        signAndExecute
      );
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
      setLoading(true);
      await marketplaceService.mintNFT(name, description, imageUrl, signAndExecute);
      await Promise.all([refreshListings(), refreshUserNFTs()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentAccount, signAndExecute, refreshListings, refreshUserNFTs]);

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
