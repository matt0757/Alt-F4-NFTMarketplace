module sui_marketplace::nft {
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use sui::event;
    use std::string::{Self, String};

    // =================== NFT Struct ===================
    
    /// Simple NFT that can be traded in the marketplace
    public struct NFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        creator: address,
    }

    // =================== Events ===================
    
    /// Event emitted when an NFT is minted
    public struct MintEvent has copy, drop {
        object_id: address,
        creator: address,
        name: String,
        description: String,
        image_url: String,
    }

    // =================== Public Functions ===================
    
    /// Create a new NFT
    public entry fun mint_nft(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let id = object::new(ctx);
        let object_id = object::uid_to_address(&id);
        
        let nft = NFT {
            id,
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: string::utf8(image_url),
            creator: tx_context::sender(ctx),
        };

        // Emit mint event
        event::emit(MintEvent {
            object_id,
            creator: tx_context::sender(ctx),
            name: nft.name,
            description: nft.description,
            image_url: nft.image_url,
        });

        // Transfer NFT directly to sender
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    /// Create NFT for marketplace listing (used by marketplace module)
    public fun create_nft(
        name: String,
        description: String,
        image_url: String,
        creator: address,
        ctx: &mut TxContext
    ): NFT {
        let id = object::new(ctx);
        
        NFT {
            id,
            name,
            description,
            image_url,
            creator,
        }
    }

    // =================== View Functions ===================
    
    /// Get NFT name
    public fun get_name(nft: &NFT): &String {
        &nft.name
    }

    /// Get NFT description
    public fun get_description(nft: &NFT): &String {
        &nft.description
    }

    /// Get NFT image URL
    public fun get_image_url(nft: &NFT): &String {
        &nft.image_url
    }

    /// Get NFT creator
    public fun get_creator(nft: &NFT): address {
        nft.creator
    }

    /// Get NFT ID
    public fun get_id(nft: &NFT): &UID {
        &nft.id
    }

    /// Destroy NFT and return its components (used by marketplace)
    public fun destroy_nft(nft: NFT): (String, String, String, address) {
        let NFT { id, name, description, image_url, creator } = nft;
        object::delete(id);
        (name, description, image_url, creator)
    }
}
