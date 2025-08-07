module sui_marketplace::marketplace {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::balance::{Self, Balance};
    use sui::event;

    // =================== Error Codes ===================
    const E_LISTING_NOT_EXISTS: u64 = 0;
    const E_LISTING_NOT_ACTIVE: u64 = 1;
    const E_INSUFFICIENT_PAYMENT: u64 = 2;
    const E_NOT_SELLER: u64 = 3;
    const E_ITEM_NOT_EXISTS: u64 = 4;

    // =================== Structs ===================
    
    /// The main marketplace object
    struct Marketplace has key {
        id: UID,
        listings: Table<ID, Listing>,
        fee_rate: u64, // Fee in basis points (e.g., 250 = 2.5%)
        balance: Balance<SUI>,
    }

    /// Individual listing information
    struct Listing has store {
        item_id: ID,
        seller: address,
        price: u64,
        is_active: bool,
    }

    /// A generic item that can be traded in the marketplace
    struct MarketplaceItem<T: store> has key, store {
        id: UID,
        data: T,
    }

    /// Admin capability for managing the marketplace
    struct AdminCap has key {
        id: UID,
    }

    // =================== Events ===================
    
    struct ItemListed has copy, drop {
        item_id: ID,
        seller: address,
        price: u64,
    }

    struct ItemSold has copy, drop {
        item_id: ID,
        seller: address,
        buyer: address,
        price: u64,
        fee: u64,
    }

    struct ListingCancelled has copy, drop {
        item_id: ID,
        seller: address,
    }

    // =================== Init Function ===================
    
    /// Initialize the marketplace
    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            listings: table::new(ctx),
            fee_rate: 250, // 2.5% default fee
            balance: balance::zero(),
        };
        
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(marketplace);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // =================== Public Functions ===================
    
    /// Create a new marketplace item
    public fun create_item<T: store>(data: T, ctx: &mut TxContext): MarketplaceItem<T> {
        MarketplaceItem {
            id: object::new(ctx),
            data,
        }
    }

    /// List an item for sale in the marketplace
    public entry fun list_item<T: store>(
        marketplace: &mut Marketplace,
        item: MarketplaceItem<T>,
        price: u64,
        ctx: &mut TxContext
    ) {
        let item_id = object::id(&item);
        let seller = tx_context::sender(ctx);
        
        let listing = Listing {
            item_id,
            seller,
            price,
            is_active: true,
        };

        table::add(&mut marketplace.listings, item_id, listing);
        
        // Transfer item to marketplace
        transfer::public_transfer(item, object::id_address(&marketplace.id));
        
        event::emit(ItemListed {
            item_id,
            seller,
            price,
        });
    }

    /// Purchase an item from the marketplace
    public entry fun purchase_item<T: store>(
        marketplace: &mut Marketplace,
        item: MarketplaceItem<T>,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let item_id = object::id(&item);
        let buyer = tx_context::sender(ctx);
        
        assert!(table::contains(&marketplace.listings, item_id), E_LISTING_NOT_EXISTS);
        
        let listing = table::remove(&mut marketplace.listings, item_id);
        assert!(listing.is_active, E_LISTING_NOT_ACTIVE);
        assert!(coin::value(&payment) >= listing.price, E_INSUFFICIENT_PAYMENT);

        // Calculate fees and seller payment
        let fee_amount = (listing.price * marketplace.fee_rate) / 10000;
        let seller_amount = listing.price - fee_amount;

        // Split payment
        let payment_balance = coin::into_balance(payment);
        let fee_balance = balance::split(&mut payment_balance, fee_amount);
        let seller_balance = balance::split(&mut payment_balance, seller_amount);
        let change_balance = payment_balance; // Remaining change for buyer

        // Add fee to marketplace balance
        balance::join(&mut marketplace.balance, fee_balance);

        // Transfer seller payment
        if (seller_amount > 0) {
            transfer::public_transfer(
                coin::from_balance(seller_balance, ctx),
                listing.seller
            );
        };

        // Return change to buyer if any
        if (balance::value(&change_balance) > 0) {
            transfer::public_transfer(
                coin::from_balance(change_balance, ctx),
                buyer
            );
        } else {
            balance::destroy_zero(change_balance);
        };

        // Transfer item to buyer
        transfer::public_transfer(item, buyer);

        event::emit(ItemSold {
            item_id,
            seller: listing.seller,
            buyer,
            price: listing.price,
            fee: fee_amount,
        });
    }

    /// Cancel a listing (only by seller)
    public entry fun cancel_listing<T: store>(
        marketplace: &mut Marketplace,
        item: MarketplaceItem<T>,
        ctx: &mut TxContext
    ) {
        let item_id = object::id(&item);
        let sender = tx_context::sender(ctx);
        
        assert!(table::contains(&marketplace.listings, item_id), E_LISTING_NOT_EXISTS);
        
        let listing = table::remove(&mut marketplace.listings, item_id);
        assert!(listing.seller == sender, E_NOT_SELLER);

        // Return item to seller
        transfer::public_transfer(item, sender);

        event::emit(ListingCancelled {
            item_id,
            seller: sender,
        });
    }

    // =================== Admin Functions ===================
    
    /// Update marketplace fee rate (admin only)
    public entry fun update_fee_rate(
        _: &AdminCap,
        marketplace: &mut Marketplace,
        new_fee_rate: u64,
    ) {
        marketplace.fee_rate = new_fee_rate;
    }

    /// Withdraw marketplace fees (admin only)
    public entry fun withdraw_fees(
        _: &AdminCap,
        marketplace: &mut Marketplace,
        ctx: &mut TxContext
    ) {
        let amount = balance::value(&marketplace.balance);
        if (amount > 0) {
            let withdrawn = coin::from_balance(
                balance::split(&mut marketplace.balance, amount),
                ctx
            );
            transfer::public_transfer(withdrawn, tx_context::sender(ctx));
        };
    }

    // =================== View Functions ===================
    
    /// Get listing information
    public fun get_listing(marketplace: &Marketplace, item_id: ID): &Listing {
        table::borrow(&marketplace.listings, item_id)
    }

    /// Check if an item is listed
    public fun is_listed(marketplace: &Marketplace, item_id: ID): bool {
        table::contains(&marketplace.listings, item_id)
    }

    /// Get marketplace fee rate
    public fun get_fee_rate(marketplace: &Marketplace): u64 {
        marketplace.fee_rate
    }

    /// Get marketplace fee balance
    public fun get_fee_balance(marketplace: &Marketplace): u64 {
        balance::value(&marketplace.balance)
    }

    /// Get listing price
    public fun get_listing_price(marketplace: &Marketplace, item_id: ID): u64 {
        let listing = table::borrow(&marketplace.listings, item_id);
        listing.price
    }

    /// Get listing seller
    public fun get_listing_seller(marketplace: &Marketplace, item_id: ID): address {
        let listing = table::borrow(&marketplace.listings, item_id);
        listing.seller
    }

    /// Check if listing is active
    public fun is_listing_active(marketplace: &Marketplace, item_id: ID): bool {
        let listing = table::borrow(&marketplace.listings, item_id);
        listing.is_active
    }
}
