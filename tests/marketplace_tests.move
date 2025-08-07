#[test_only]
module sui_marketplace::marketplace_tests {
    use sui::test_scenario::{Self as test, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui_marketplace::marketplace::{Self, Marketplace, AdminCap, MarketplaceItem};
    use sui_marketplace::nft::{Self, NFT};

    const ADMIN: address = @0xA;
    const SELLER: address = @0xB;
    const BUYER: address = @0xC;

    #[test]
    public fun test_marketplace_creation() {
        let scenario = test::begin(ADMIN);
        
        // Initialize marketplace
        {
            marketplace::init(test::ctx(&mut scenario));
        };

        // Check that marketplace and admin cap were created
        test::next_tx(&mut scenario, ADMIN);
        {
            assert!(test::has_most_recent_shared<Marketplace>(), 0);
            assert!(test::has_most_recent_for_sender<AdminCap>(&scenario), 1);
        };

        test::end(scenario);
    }

    #[test]
    public fun test_nft_minting() {
        let scenario = test::begin(SELLER);
        
        // Mint an NFT
        {
            nft::mint_nft(
                b"Test NFT",
                b"A test NFT for marketplace",
                b"https://example.com/image.png",
                test::ctx(&mut scenario)
            );
        };

        // Check that NFT was created
        test::next_tx(&mut scenario, SELLER);
        {
            assert!(test::has_most_recent_for_sender<MarketplaceItem<NFT>>(&scenario), 0);
        };

        test::end(scenario);
    }

    #[test]
    public fun test_listing_and_purchase() {
        let scenario = test::begin(ADMIN);
        
        // Initialize marketplace
        {
            marketplace::init(test::ctx(&mut scenario));
        };

        // Seller mints an NFT
        test::next_tx(&mut scenario, SELLER);
        {
            nft::mint_nft(
                b"Test NFT",
                b"A test NFT for marketplace",
                b"https://example.com/image.png",
                test::ctx(&mut scenario)
            );
        };

        // Seller lists the NFT
        test::next_tx(&mut scenario, SELLER);
        {
            let marketplace = test::take_shared<Marketplace>(&scenario);
            let nft_item = test::take_from_sender<MarketplaceItem<NFT>>(&scenario);
            
            marketplace::list_item(&mut marketplace, nft_item, 1000, test::ctx(&mut scenario));
            
            test::return_shared(marketplace);
        };

        // Buyer purchases the NFT
        test::next_tx(&mut scenario, BUYER);
        {
            let marketplace = test::take_shared<Marketplace>(&scenario);
            let nft_item = test::take_from_address<MarketplaceItem<NFT>>(&scenario, @sui_marketplace);
            let payment = coin::mint_for_testing<SUI>(1000, test::ctx(&mut scenario));
            
            marketplace::purchase_item(&mut marketplace, nft_item, payment, test::ctx(&mut scenario));
            
            test::return_shared(marketplace);
        };

        // Check that buyer received the NFT
        test::next_tx(&mut scenario, BUYER);
        {
            assert!(test::has_most_recent_for_sender<MarketplaceItem<NFT>>(&scenario), 0);
        };

        test::end(scenario);
    }
}
