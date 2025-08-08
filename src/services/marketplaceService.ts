import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { MARKETPLACE_CONFIG } from '../config/constants';

export interface NFTObject {
  objectId: string;
  name: string;
  description: string;
  imageUrl: string;
  owner: string;
  isListed?: boolean;
  price?: number;
}

export class MarketplaceService {
  constructor(private client: SuiClient) {}

  async mintNFT(
    name: string,
    description: string,
    imageUrl: string,
    signAndExecute: (tx: Transaction) => Promise<any>
  ) {
    try {
      const tx = new Transaction();
      
      // Log the exact function we're calling
      console.log('🔧 Calling mint function:', `${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::mint_nft`);
      console.log('🔧 With arguments:', { name, description, imageUrl });
      
      // Use vector<u8> instead of string for Move compatibility
      tx.moveCall({
        target: `${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::mint_nft`,
        arguments: [
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(name))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(description))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(imageUrl))),
        ],
      });

      console.log('🔧 Transaction created, executing...');
      const result = await signAndExecute(tx);
      console.log('✅ Full mint transaction result:', result);
      
      // Extract the created objects from the transaction result
      if (result?.effects?.created) {
        console.log('🎯 Created objects:', result.effects.created);
      }
      
      // Check for errors in the transaction
      if (result?.effects?.status?.status === 'failure') {
        console.error('❌ Transaction failed:', result.effects.status);
        throw new Error(`Transaction failed: ${result.effects.status.error || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error in mintNFT:', error);
      throw error;
    }
  }

  async getUserNFTs(userAddress: string): Promise<NFTObject[]> {
    try {
      console.log('🔍 Fetching NFTs for user:', userAddress);
      
      // Get all objects owned by the user
      const ownedObjects = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::NFT`
        },
        options: {
          showContent: true,
          showDisplay: true,
          showType: true,
        }
      });

      console.log('📦 Raw owned objects:', ownedObjects);

      // Get current marketplace listings to filter out listed items
      const currentListings = await this.getListings();
      const listedItemIds = new Set(currentListings.map(listing => listing.itemId));
      console.log('🏪 Currently listed items:', Array.from(listedItemIds));

      const nfts: NFTObject[] = [];

      for (const obj of ownedObjects.data) {
        if (obj.data?.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          const objectId = obj.data.objectId;
          
          // Skip if this NFT is currently listed in the marketplace
          if (listedItemIds.has(objectId)) {
            console.log('⚠️ Skipping listed NFT:', objectId);
            continue;
          }
          
          // Try to extract NFT data from different possible field structures
          const nft: NFTObject = {
            objectId,
            name: fields.name || fields.title || `NFT #${objectId.slice(0, 8)}`,
            description: fields.description || fields.desc || 'No description',
            imageUrl: fields.image_url || fields.imageUrl || fields.url || '',
            owner: userAddress,
          };
          
          nfts.push(nft);
          console.log('✅ Parsed owned NFT:', nft);
        }
      }

      // Also check for NFTs with display metadata
      for (const obj of ownedObjects.data) {
        if (obj.data?.display?.data) {
          const display = obj.data.display.data;
          const objectId = obj.data.objectId;
          
          // Skip if this NFT is currently listed in the marketplace
          if (listedItemIds.has(objectId)) {
            console.log('⚠️ Skipping listed NFT (display):', objectId);
            continue;
          }
          
          const nft: NFTObject = {
            objectId,
            name: display.name || `NFT #${objectId.slice(0, 8)}`,
            description: display.description || 'No description',
            imageUrl: display.image_url || display.link || '',
            owner: userAddress,
          };
          
          // Check if we already added this NFT
          if (!nfts.find(n => n.objectId === nft.objectId)) {
            nfts.push(nft);
            console.log('✅ Parsed owned NFT from display:', nft);
          }
        }
      }

      console.log('🎯 Total NFTs found:', nfts.length);
      return nfts;
    } catch (error) {
      console.error('❌ Error fetching user NFTs:', error);
      return [];
    }
  }

  async listItem(
    signer: string,
    itemObjectId: string,
    price: number,
    signAndExecute: (tx: Transaction) => Promise<any>
  ) {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${MARKETPLACE_CONFIG.PACKAGE_ID}::marketplace::list_item`,
      arguments: [
        tx.object(MARKETPLACE_CONFIG.MARKETPLACE_ID),
        tx.object(itemObjectId),
        tx.pure.u64(price * 1e9), // Convert SUI to MIST
      ],
      typeArguments: [`${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::NFT`],
    });

    return await signAndExecute(tx);
  }

  // Get NFTs that the user has listed for sale
  async getUserListedNFTs(userAddress: string): Promise<NFTObject[]> {
    try {
      console.log('🔍 Fetching listed NFTs for user:', userAddress);
      
      // Get all marketplace listings
      const allListings = await this.getListings();
      
      // Filter to only include listings by this user
      const userListings = allListings.filter(listing => listing.seller === userAddress);
      console.log('🏪 User listings found:', userListings.length);
      
      // Convert listings to NFTObject format
      const listedNFTs: NFTObject[] = userListings.map(listing => ({
        objectId: listing.itemId,
        name: (listing as any).name || `NFT #${listing.itemId.slice(0, 8)}`,
        description: (listing as any).description || 'No description',
        imageUrl: (listing as any).imageUrl || '',
        owner: userAddress,
        isListed: true,
        price: listing.price / 1e9, // Convert from MIST to SUI
      }));
      
      console.log('🎯 User listed NFTs:', listedNFTs);
      return listedNFTs;
    } catch (error) {
      console.error('❌ Error fetching user listed NFTs:', error);
      return [];
    }
  }

  async purchaseItem(
    itemId: string,
    price: number,
    signAndExecute: (tx: Transaction) => Promise<any>
  ) {
    const tx = new Transaction();
    
    const [coin] = tx.splitCoins(tx.gas, [price]);
    
    tx.moveCall({
      target: `${MARKETPLACE_CONFIG.PACKAGE_ID}::marketplace::purchase_item`,
      arguments: [
        tx.object(MARKETPLACE_CONFIG.MARKETPLACE_ID),
        tx.pure.id(itemId),
        coin,
      ],
      typeArguments: [`${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::NFT`],
    });

    return await signAndExecute(tx);
  }

  async getListings() {
    try {
      console.log('🔍 Fetching marketplace listings...');
      
      // Query marketplace events to get listings
      const listingEvents = await this.client.queryEvents({
        query: {
          MoveEventType: `${MARKETPLACE_CONFIG.PACKAGE_ID}::marketplace::ItemListed`
        },
        limit: 50,
        order: 'descending'
      });

      console.log('📦 Found listing events:', listingEvents.data.length);

      // Also fetch mint events to correlate NFT metadata
      const mintEvents = await this.client.queryEvents({
        query: {
          MoveEventType: `${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::MintEvent`
        },
        limit: 100,
        order: 'descending'
      });

      console.log('🎨 Found mint events:', mintEvents.data.length);

      // Create a map of object_id to NFT metadata from mint events
      const nftMetadataMap = new Map();
      mintEvents.data.forEach(event => {
        const parsed = event.parsedJson as any;
        if (parsed?.object_id) {
          nftMetadataMap.set(parsed.object_id, {
            name: parsed.name || 'Unknown NFT',
            description: parsed.description || 'No description',
            imageUrl: parsed.image_url || '',
            creator: parsed.creator
          });
        }
      });

      console.log('🗺️ NFT metadata map:', nftMetadataMap);

      // Enrich each listing with NFT details
      const enrichedListings = await Promise.all(
        listingEvents.data.map(async (event) => {
          const parsed = event.parsedJson as any;
          const itemId = parsed?.item_id || '';
          
          const basicListing = {
            itemId,
            seller: parsed?.seller || '',
            price: Number(parsed?.price) || 0,
            timestamp: event.timestampMs,
          };

          // First try to match with mint events
          const metadata = nftMetadataMap.get(itemId);
          if (metadata) {
            console.log('✅ Found metadata from mint events for:', itemId);
            return {
              ...basicListing,
              name: metadata.name,
              description: metadata.description,
              imageUrl: metadata.imageUrl,
            };
          }

          // If no match in mint events, try to fetch the marketplace item directly
          try {
            console.log('🔍 Trying to fetch marketplace item directly:', itemId);
            const marketplaceItem = await this.client.getObject({
              id: itemId,
              options: {
                showContent: true,
                showDisplay: true,
                showType: true,
              }
            });

            console.log('📦 Marketplace item result:', marketplaceItem);

            // Check if this is a MarketplaceItem wrapper
            if (marketplaceItem.data?.content && 'fields' in marketplaceItem.data.content) {
              const fields = marketplaceItem.data.content.fields as any;
              
              // Look for the inner NFT object
              if (fields.inner && fields.inner.fields) {
                const nftFields = fields.inner.fields;
                console.log('🎯 Found inner NFT fields:', nftFields);
                
                return {
                  ...basicListing,
                  name: nftFields.name || `NFT #${itemId.slice(0, 8)}`,
                  description: nftFields.description || 'No description',
                  imageUrl: nftFields.image_url || nftFields.imageUrl || '',
                };
              }
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch marketplace item:', itemId, error);
          }

          // Return basic listing as fallback
          console.log('🔄 Using fallback data for:', itemId);
          return basicListing;
        })
      );

      console.log('🎯 Final enriched listings:', enrichedListings);
      return enrichedListings;
    } catch (error) {
      console.error('❌ Error fetching listings:', error);
      return [];
    }
  }

  // Request testnet SUI tokens for gas
  async requestTestnetSui(userAddress: string): Promise<boolean> {
    try {
      console.log('💰 Requesting testnet SUI for:', userAddress);
      
      // Try the official faucet first
      const response = await fetch('https://faucet.testnet.sui.io/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: userAddress
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Testnet SUI requested successfully:', result);
        // Wait a moment for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 3000));
        return true;
      } else if (response.status === 429) {
        console.warn('⚠️ Faucet rate limited. Please use manual faucet.');
        throw new Error('RATE_LIMITED');
      } else {
        console.error('❌ Failed to request testnet SUI:', response.statusText);
        return false;
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'RATE_LIMITED') {
        throw error;
      }
      console.error('❌ Error requesting testnet SUI:', error);
      return false;
    }
  }

  // Test function to verify transaction system works
  async testTransaction(signAndExecute: (tx: Transaction) => Promise<any>) {
    try {
      console.log('🧪 Testing basic transaction...');
      const tx = new Transaction();
      
      // Simple SUI transfer to self (should always work)
      tx.transferObjects([tx.gas], tx.pure.address('0x0000000000000000000000000000000000000000000000000000000000000000'));
      
      const result = await signAndExecute(tx);
      console.log('✅ Test transaction result:', result);
      return result;
    } catch (error) {
      console.error('❌ Test transaction failed:', error);
      throw error;
    }
  }

  // Get NFT details from transaction effects
  async getNFTFromTransaction(txDigest: string): Promise<NFTObject | null> {
    try {
      console.log('🔍 Getting NFT from transaction:', txDigest);
      
      // Wait a bit for transaction to be indexed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txDetails = await this.client.getTransactionBlock({
        digest: txDigest,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        }
      });
      
      console.log('📦 Transaction details:', txDetails);
      
      // Look for created objects in effects
      if (txDetails.effects?.created) {
        for (const created of txDetails.effects.created) {
          const objectId = created.reference.objectId;
          console.log('🔍 Checking created object:', objectId);
          
          try {
            const obj = await this.client.getObject({
              id: objectId,
              options: { showContent: true, showType: true }
            });
            
            console.log('📋 Object details:', obj);
            
            // Check if this is an NFT by looking at the type
            if (obj.data?.type?.includes('::nft::NFT')) {
              const fields = (obj.data.content as any)?.fields;
              if (fields) {
                return {
                  objectId,
                  name: fields.name || 'Unknown',
                  description: fields.description || 'No description',
                  imageUrl: fields.image_url || '',
                  owner: obj.data.owner as string || '',
                };
              }
            }
          } catch (objError) {
            console.warn('⚠️ Error fetching object:', objError);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting NFT from transaction:', error);
      return null;
    }
  }

  // Add this method to directly fetch a specific NFT object
  async getNFTByObjectId(objectId: string): Promise<NFTObject | null> {
    try {
      console.log('🔍 Fetching specific NFT object:', objectId);
      
      const object = await this.client.getObject({
        id: objectId,
        options: {
          showContent: true,
          showDisplay: true,
          showType: true,
          showOwner: true,
        }
      });

      console.log('📦 Direct object fetch result:', object);

      if (object.data) {
        let nft: NFTObject | null = null;

        // Extract owner
        const owner = typeof object.data.owner === 'string' 
          ? object.data.owner 
          : (object.data.owner as any)?.AddressOwner || '';

        // Try to extract from content fields
        if (object.data.content && 'fields' in object.data.content) {
          const fields = object.data.content.fields as any;
          nft = {
            objectId: object.data.objectId,
            name: fields.name || `NFT #${object.data.objectId.slice(0, 8)}`,
            description: fields.description || 'No description',
            imageUrl: fields.image_url || fields.imageUrl || '',
            owner: owner,
          };
        }

        // Try to extract from display data
        if (!nft && object.data.display?.data) {
          const display = object.data.display.data;
          nft = {
            objectId: object.data.objectId,
            name: display.name || `NFT #${object.data.objectId.slice(0, 8)}`,
            description: display.description || 'No description',
            imageUrl: display.image_url || display.link || '',
            owner: owner,
          };
        }

        console.log('✅ Parsed NFT from direct fetch:', nft);
        return nft;
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching NFT by object ID:', error);
      return null;
    }
  }
  async getTransactionDetails(digest: string) {
    try {
      const txDetails = await this.client.getTransactionBlock({
        digest: digest,
        options: {
          showEffects: true,
          showEvents: true,
          showInput: true,
          showBalanceChanges: true,
          showObjectChanges: true,
        }
      });
      
      console.log('📋 Transaction details:', txDetails);
      return txDetails;
    } catch (error) {
      console.error('❌ Error fetching transaction details:', error);
      return null;
    }
  }

  // Alternative method: Query transaction events to find minted NFTs
  async getUserNFTsFromEvents(userAddress: string): Promise<NFTObject[]> {
    try {
      console.log('🔍 Fetching NFTs from events for user:', userAddress);
      
      // Query for mint events
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::MintEvent`
        },
        limit: 100,
        order: 'descending'
      });

      console.log('📦 Mint events found:', events);

      const userNFTs = events.data
        .filter(event => {
          const parsed = event.parsedJson as any;
          return parsed?.creator === userAddress;
        })
        .map(event => {
          const parsed = event.parsedJson as any;
          return {
            objectId: parsed?.object_id || event.id?.txDigest || '',
            name: parsed?.name || `NFT #${Date.now()}`,
            description: parsed?.description || 'No description',
            imageUrl: parsed?.image_url || '',
            owner: userAddress,
          };
        });

      console.log('🎯 User NFTs from events:', userNFTs);
      return userNFTs;
    } catch (error) {
      console.error('❌ Error fetching NFTs from events:', error);
      return [];
    }
  }
}
