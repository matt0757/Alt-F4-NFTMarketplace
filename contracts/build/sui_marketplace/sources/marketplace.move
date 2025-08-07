module sui_marketplace::marketplace {
    use sui::object::{UID, ID};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::event;
    use sui::balance::{Self, Balance};

    // =================== Error Constants ===================
    
    const E_NOT_LISTED: u64 = 0;
    const E_NOT_ACTIVE: u64 = 1;
    const E_INSUFFICIENT_PAYMENT: u64 = 2;
    const E_NOT_SELLER: u64 = 3;

    // =================== Structs ===================
    
    /// Wrapper for marketplace items
    public struct MarketplaceItem<T: store> has key, store {
        id: UID,
        inner: T,
    }

    /// Marketplace shared object
    public struct Marketplace has key {
        id: UID,
        listings: Table<ID, Listing>,
        fee_rate: u64, // Fee in basis points (e.g., 250 = 2.5%)
        admin: address,
    }

    /// Listing information
    public struct Listing has store, drop {
        seller: address,
        price: u64,
        is_active: bool,
    }

    /// Admin capability
    public struct AdminCap has key {
        id: UID,
    }

    // =================== Events ===================
    
    public struct ItemListed has copy, drop {
        item_id: ID,
        seller: address,
        price: u64,
    }

    public struct ItemSold has copy, drop {
        item_id: ID,
        seller: address,
        buyer: address,
        price: u64,
    }

    public struct ListingCancelled has copy, drop {
        item_id: ID,
        seller: address,
    }

    // =================== Functions ===================
    
    /// Initialize marketplace
    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let marketplace = Marketplace {
            id: object::new(ctx),
            listings: table::new(ctx),
            fee_rate: 250, // 2.5% default fee
            admin: sender,
        };
        
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(marketplace);
        transfer::transfer(admin_cap, sender);
    }

    /// Create a marketplace item wrapper
    public fun create_item<T: store>(inner: T, ctx: &mut TxContext): MarketplaceItem<T> {
        MarketplaceItem {
            id: object::new(ctx),
            inner,
        }
    }

    /// List an item for sale
    public entry fun list_item<T: store>(
        marketplace: &mut Marketplace,
        item: MarketplaceItem<T>,
        price: u64,
        ctx: &mut TxContext
    ) {
        let item_id = object::id(&item);
        let seller = tx_context::sender(ctx);
        
        let listing = Listing {
            seller,
            price,
            is_active: true,
        };

        table::add(&mut marketplace.listings, item_id, listing);
        
        event::emit(ItemListed {
            item_id,
            seller,
            price,
        });

        // Transfer item to marketplace for safekeeping
        transfer::public_transfer(item, marketplace.admin);
    }

    /// Purchase an item
    public entry fun purchase_item<T: store>(
        marketplace: &mut Marketplace,
        item_id: ID,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&marketplace.listings, item_id), E_NOT_LISTED);
        
        let listing = table::borrow_mut(&mut marketplace.listings, item_id);
        assert!(listing.is_active, E_NOT_ACTIVE);
        assert!(coin::value(&payment) >= listing.price, E_INSUFFICIENT_PAYMENT);

        let buyer = tx_context::sender(ctx);
        let seller = listing.seller;
        let price = listing.price;

        // Calculate fees
        let fee_amount = (price * marketplace.fee_rate) / 10000;
        let seller_amount = price - fee_amount;

        // Mark as sold
        listing.is_active = false;

        // Handle payment distribution
        let mut payment_balance = coin::into_balance(payment);
        let fee_balance = balance::split(&mut payment_balance, fee_amount);
        
        // Transfer seller payment
        let seller_coin = coin::from_balance(payment_balance, ctx);
        transfer::public_transfer(seller_coin, seller);

        // Keep fees in marketplace (admin can withdraw later)
        let fee_coin = coin::from_balance(fee_balance, ctx);
        transfer::public_transfer(fee_coin, marketplace.admin);

        event::emit(ItemSold {
            item_id,
            seller,
            buyer,
            price,
        });

        // Note: Item transfer would need to be handled separately
        // as we need the actual item object
    }

    /// Cancel a listing
    public entry fun cancel_listing(
        marketplace: &mut Marketplace,
        item_id: ID,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&marketplace.listings, item_id), E_NOT_LISTED);
        
        let listing = table::borrow_mut(&mut marketplace.listings, item_id);
        assert!(listing.seller == tx_context::sender(ctx), E_NOT_SELLER);
        
        listing.is_active = false;

        event::emit(ListingCancelled {
            item_id,
            seller: listing.seller,
        });
    }

    /// Get listing info (read-only)
    public fun get_listing(marketplace: &Marketplace, item_id: ID): &Listing {
        table::borrow(&marketplace.listings, item_id)
    }

    /// Check if item is listed
    public fun is_listed(marketplace: &Marketplace, item_id: ID): bool {
        table::contains(&marketplace.listings, item_id)
    }

    /// Get marketplace fee rate
    public fun get_fee_rate(marketplace: &Marketplace): u64 {
        marketplace.fee_rate
    }

    /// Update fee rate (admin only)
    public entry fun update_fee_rate(
        marketplace: &mut Marketplace,
        _admin_cap: &AdminCap,
        new_fee_rate: u64,
        _ctx: &mut TxContext
    ) {
        marketplace.fee_rate = new_fee_rate;
    }
}
