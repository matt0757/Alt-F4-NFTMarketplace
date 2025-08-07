import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { MARKETPLACE_CONFIG } from '../config/constants';

export class MarketplaceService {
  constructor(private client: SuiClient) {}

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
        tx.pure.u64(price),
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
        itemId: event.parsedJson?.item_id || event.id?.txDigest || '',
        seller: event.parsedJson?.seller || '',
        price: parseInt(event.parsedJson?.price || '0'),
        timestamp: event.timestampMs || Date.now().toString(),
        name: event.parsedJson?.name || null,
        description: event.parsedJson?.description || null,
        imageUrl: event.parsedJson?.image_url || null,
      }));
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      return [];
    }
  }

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

    return await signAndExecute(tx);
  }

  async getUserNFTs(userAddress: string) {
    try {
      // Query user's owned objects that are NFTs
      const objects = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${MARKETPLACE_CONFIG.PACKAGE_ID}::nft::NFT`
        },
        options: {
          showContent: true,
          showDisplay: true,
        }
      });

      return objects.data.map(obj => ({
        objectId: obj.data?.objectId || '',
        name: obj.data?.display?.data?.name || 'Unknown NFT',
        description: obj.data?.display?.data?.description || '',
        imageUrl: obj.data?.display?.data?.image_url || '',
      }));
    } catch (error) {
      console.error('Failed to fetch user NFTs:', error);
      return [];
    }
  }
}
