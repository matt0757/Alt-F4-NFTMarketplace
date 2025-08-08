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
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::mint_nft`,
      arguments: [
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(imageUrl),
      ],
    });

    const result = await signAndExecute(tx);
    console.log('✅ NFT minted successfully:', result);
    return result;
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

      const nfts: NFTObject[] = [];

      for (const obj of ownedObjects.data) {
        if (obj.data?.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          
          // Try to extract NFT data from different possible field structures
          const nft: NFTObject = {
            objectId: obj.data.objectId,
            name: fields.name || fields.title || `NFT #${obj.data.objectId.slice(0, 8)}`,
            description: fields.description || fields.desc || 'No description',
            imageUrl: fields.image_url || fields.imageUrl || fields.url || '',
            owner: userAddress,
          };
          
          nfts.push(nft);
          console.log('✅ Parsed NFT:', nft);
        }
      }

      // Also check for NFTs with display metadata
      for (const obj of ownedObjects.data) {
        if (obj.data?.display?.data) {
          const display = obj.data.display.data;
          const nft: NFTObject = {
            objectId: obj.data.objectId,
            name: display.name || `NFT #${obj.data.objectId.slice(0, 8)}`,
            description: display.description || 'No description',
            imageUrl: display.image_url || display.link || '',
            owner: userAddress,
          };
          
          // Check if we already added this NFT
          if (!nfts.find(n => n.objectId === nft.objectId)) {
            nfts.push(nft);
            console.log('✅ Parsed NFT from display:', nft);
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
      // Query marketplace events to get listings
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${MARKETPLACE_CONFIG.PACKAGE_ID}::marketplace::ItemListed`
        },
        limit: 50,
        order: 'descending'
      });

      return events.data.map(event => ({
        itemId: event.parsedJson?.item_id,
        seller: event.parsedJson?.seller,
        price: Number(event.parsedJson?.price) || 0,
        timestamp: event.timestampMs,
      }));
    } catch (error) {
      console.error('❌ Error fetching listings:', error);
      return [];
    }
  }

  // Alternative method to get all NFTs (for testing)
  async getAllNFTs(): Promise<NFTObject[]> {
    try {
      console.log('🔍 Fetching all NFTs of type:', `${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::NFT`);
      
      // Query for all objects of the NFT type
      const allNFTs = await this.client.queryEvents({
        query: {
          MoveEventType: `${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::MintEvent`
        },
        limit: 100,
        order: 'descending'
      });

      console.log('📦 All NFT events:', allNFTs);

      const nfts: NFTObject[] = allNFTs.data.map(event => ({
        objectId: event.parsedJson?.object_id || event.id?.txDigest || '',
        name: event.parsedJson?.name || `NFT #${Date.now()}`,
        description: event.parsedJson?.description || 'No description',
        imageUrl: event.parsedJson?.image_url || '',
        owner: event.parsedJson?.creator || '',
      }));

      return nfts;
    } catch (error) {
      console.error('❌ Error fetching all NFTs:', error);
      return [];
    }
  }
}
