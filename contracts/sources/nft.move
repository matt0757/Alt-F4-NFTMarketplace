module sui_marketplace::nft {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui_marketplace::marketplace::{Self, MarketplaceItem};

    // =================== NFT Struct ===================
    
    /// Simple NFT that can be traded in the marketplace
    struct NFT has store {
        name: String,
        description: String,
        image_url: String,
        creator: address,
    }

    // =================== Public Functions ===================
    
    /// Create a new NFT
    public entry fun mint_nft(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let nft = NFT {
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: string::utf8(image_url),
            creator: tx_context::sender(ctx),
        };

        let marketplace_item = marketplace::create_item(nft, ctx);
        transfer::public_transfer(marketplace_item, tx_context::sender(ctx));
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
}
