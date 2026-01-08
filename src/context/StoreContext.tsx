"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface Product {
    id: string | number;
    title: string;
    price: number;
    discountedPrice: number;
    image: string;
    sizes?: string[];
    materials?: string[];
}

export interface Address {
    id: string;
    name: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    phone: string;
    is_default?: boolean;
}

interface StoreContextType {
    wishlist: Product[];
    cart: Product[];
    addresses: Address[];
    selectedAddressId: string | null;
    toggleWishlist: (product: Product) => void;
    isInWishlist: (id: string | number) => boolean;
    addToCart: (product: Product) => void;
    removeFromCart: (id: string | number, index?: number) => void;
    updateCartItem: (index: number, updates: Partial<Product>) => void;
    removeFromWishlist: (id: string | number) => void;
    moveToWishlist: (product: Product, index?: number) => void;

    // Address Actions
    addAddress: (address: Omit<Address, "id">) => Promise<string>;
    updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    selectAddress: (id: string) => void;

    // Auth Actions
    user: User | null;
    session: Session | null;
    logout: () => Promise<void>;

    // Transaction Actions
    placeOrder: () => Promise<{ success: boolean, orderId?: string, error?: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [cart, setCart] = useState<Product[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Initial session and auth listener
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Persist to localStorage
    useEffect(() => {
        const savedWishlist = localStorage.getItem("wishlist");
        const savedCart = localStorage.getItem("cart");
        const savedAddresses = localStorage.getItem("addresses");
        const savedSelectedId = localStorage.getItem("selectedAddressId");

        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedAddresses) setAddresses(JSON.parse(savedAddresses));
        if (savedSelectedId) setSelectedAddressId(savedSelectedId);
    }, []);

    // Sync addresses and cart with Supabase if user is logged in
    useEffect(() => {
        async function fetchUserData() {
            if (!user) {
                // Clear user-specific data when user logs out
                setAddresses([]);
                setSelectedAddressId(null);
                setCart([]);
                setWishlist([]);
                setIsDataLoaded(false);
                return;
            }

            // Fetch addresses
            const { data: addressData, error: addressError } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id);

            if (!addressError && addressData) {
                setAddresses(addressData.map(addr => ({
                    ...addr,
                    street: addr.street,
                    landmark: addr.landmark,
                    zip: addr.zip
                })));
                const defaultAddr = addressData.find(a => a.is_default);
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            }

            // Fetch cart items
            const { data: cartData, error: cartError } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id);

            if (!cartError && cartData) {
                const cartItems = cartData.map(item => ({
                    id: item.product_id,
                    title: item.title,
                    price: parseFloat(item.price),
                    discountedPrice: parseFloat(item.discounted_price),
                    image: item.image
                }));
                setCart(cartItems);
            }

            // Fetch wishlist items
            const { data: wishlistData, error: wishlistError } = await supabase
                .from('wishlist_items')
                .select('*')
                .eq('user_id', user.id);

            if (!wishlistError && wishlistData) {
                const wishlistItems = wishlistData.map(item => ({
                    id: item.product_id,
                    title: item.title,
                    price: parseFloat(item.price),
                    discountedPrice: parseFloat(item.discounted_price),
                    image: item.image
                }));
                setWishlist(wishlistItems);
            }

            setIsDataLoaded(true);
        }
        fetchUserData();
    }, [user]);

    // Sync wishlist to Supabase function
    const syncWishlistToSupabase = React.useCallback(async () => {
        if (!user) return;

        console.log('Syncing wishlist to Supabase:', wishlist.length, 'items');

        try {
            // Delete all existing wishlist items for this user
            const { error: deleteError } = await supabase
                .from('wishlist_items')
                .delete()
                .eq('user_id', user.id);

            if (deleteError) {
                console.error('Error deleting wishlist items:', deleteError);
                return;
            }

            // Insert current wishlist items
            if (wishlist.length > 0) {
                const wishlistItems = wishlist.map(item => ({
                    user_id: user.id,
                    product_id: item.id,
                    title: item.title,
                    price: item.price,
                    discounted_price: item.discountedPrice,
                    image: item.image
                }));

                const { error: insertError } = await supabase
                    .from('wishlist_items')
                    .insert(wishlistItems);

                if (insertError) {
                    console.error('Error inserting wishlist items:', insertError);
                } else {
                    console.log('Wishlist synced successfully!');
                }
            }
        } catch (error) {
            console.error('Error syncing wishlist to Supabase:', error);
        }
    }, [user, wishlist]);

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));

        // Debounce sync to Supabase if user is logged in AND data is loaded
        if (user && isDataLoaded) {
            const timeoutId = setTimeout(() => {
                syncWishlistToSupabase();
            }, 500); // Wait 500ms before syncing

            return () => clearTimeout(timeoutId);
        }
    }, [wishlist, user, isDataLoaded, syncWishlistToSupabase]);

    // Sync cart to Supabase function
    const syncCartToSupabase = React.useCallback(async () => {
        if (!user) return;

        console.log('Syncing cart to Supabase:', cart.length, 'items');

        try {
            // Delete all existing cart items for this user
            const { error: deleteError } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);

            if (deleteError) {
                console.error('Error deleting cart items:', deleteError);
                return;
            }

            // Insert current cart items
            if (cart.length > 0) {
                const cartItems = cart.map(item => ({
                    user_id: user.id,
                    product_id: item.id,
                    title: item.title,
                    price: item.price,
                    discounted_price: item.discountedPrice,
                    image: item.image,
                    quantity: 1
                }));

                const { error: insertError } = await supabase
                    .from('cart_items')
                    .insert(cartItems);

                if (insertError) {
                    console.error('Error inserting cart items:', insertError);
                } else {
                    console.log('Cart synced successfully!');
                }
            }
        } catch (error) {
            console.error('Error syncing cart to Supabase:', error);
        }
    }, [user, cart]);

    // Sync cart to both localStorage and Supabase
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));

        // Debounce sync to Supabase if user is logged in AND data is loaded
        if (user && isDataLoaded) {
            const timeoutId = setTimeout(() => {
                syncCartToSupabase();
            }, 500); // Wait 500ms before syncing

            return () => clearTimeout(timeoutId);
        }
    }, [cart, user, isDataLoaded, syncCartToSupabase]);

    useEffect(() => {
        localStorage.setItem("addresses", JSON.stringify(addresses));
    }, [addresses]);

    useEffect(() => {
        if (selectedAddressId) {
            localStorage.setItem("selectedAddressId", selectedAddressId);
        }
    }, [selectedAddressId]);

    const toggleWishlist = (product: Product) => {
        setWishlist((prev) => {
            const exists = prev.find((p) => p.id === product.id);
            if (exists) {
                return prev.filter((p) => p.id !== product.id);
            }
            return [...prev, product];
        });
    };

    const isInWishlist = (id: string | number) => {
        return wishlist.some((p) => p.id === id);
    };

    const removeFromWishlist = (id: string | number) => {
        setWishlist((prev) => prev.filter((p) => p.id !== id));
    };

    const addToCart = (product: Product) => {
        setCart((prev) => [...prev, product]);
    };

    const removeFromCart = (id: string | number, index?: number) => {
        setCart((prev) => {
            if (index !== undefined) {
                const newCart = [...prev];
                newCart.splice(index, 1);
                return newCart;
            }
            const firstIndex = prev.findIndex((p) => p.id === id);
            if (firstIndex > -1) {
                const newCart = [...prev];
                newCart.splice(firstIndex, 1);
                return newCart;
            }
            return prev;
        });
    };

    const updateCartItem = (index: number, updates: Partial<Product>) => {
        setCart((prev) => {
            const newCart = [...prev];
            if (newCart[index]) {
                newCart[index] = { ...newCart[index], ...updates };
            }
            return newCart;
        });
    };

    const moveToWishlist = (product: Product, index?: number) => {
        removeFromCart(product.id, index);
        setWishlist((prev) => {
            const exists = prev.find((p) => p.id === product.id);
            if (!exists) return [...prev, product];
            return prev;
        });
    };

    const addAddress = async (addressData: Omit<Address, "id">) => {
        if (user) {
            const { data, error } = await supabase
                .from('addresses')
                .insert({ ...addressData, user_id: user.id })
                .select()
                .single();

            if (error) throw error;
            setAddresses(prev => [...prev, data]);
            setSelectedAddressId(data.id);
            return data.id;
        } else {
            const newAddress: Address = {
                ...addressData,
                id: crypto.randomUUID()
            };
            setAddresses(prev => [...prev, newAddress]);
            setSelectedAddressId(newAddress.id);
            return newAddress.id;
        }
    };

    const updateAddress = async (id: string, updates: Partial<Address>) => {
        if (user) {
            const { error } = await supabase
                .from('addresses')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        }
        setAddresses(prev => prev.map(addr => addr.id === id ? { ...addr, ...updates } : addr));
    };

    const deleteAddress = async (id: string) => {
        if (user) {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', id);
            if (error) throw error;
        }
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        if (selectedAddressId === id) setSelectedAddressId(null);
    };

    const selectAddress = (id: string) => {
        setSelectedAddressId(id);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        // Clear user-specific data from localStorage on logout
        // Note: Cart and wishlist are now stored in Supabase per user, so we just clear local cache
        localStorage.removeItem("addresses");
        localStorage.removeItem("selectedAddressId");
        localStorage.removeItem("cart");
        localStorage.removeItem("wishlist");
        window.location.href = "/";
    };

    const placeOrder = async () => {
        console.log("Place Order Started", { user: !!user, cartLength: cart.length, selectedAddressId });
        if (!user || cart.length === 0 || !selectedAddressId) {
            return {
                success: false,
                error: `Missing required information: ${!user ? 'User' : ''} ${cart.length === 0 ? 'Cart' : ''} ${!selectedAddressId ? 'Address' : ''}`.trim()
            };
        }

        const subtotal = cart.reduce((acc, item) => acc + item.discountedPrice, 0);
        const shipping = subtotal > 1500 ? 0 : 99;
        const total = subtotal + shipping;

        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    address_id: selectedAddressId,
                    total_amount: total,
                    status: 'pending',
                    payment_method: 'cod'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id.toString(),
                title: item.title,
                price: item.discountedPrice,
                image: item.image,
                quantity: 1
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Clear Cart
            setCart([]);
            localStorage.removeItem("cart");

            return { success: true, orderId: order.id };
        } catch (err: any) {
            const errorStr = JSON.stringify(err, Object.getOwnPropertyNames(err));
            console.error("Checkout Error Detailed:", errorStr);
            return { success: false, error: err.message || "An unexpected error occurred." };
        }
    };

    return (
        <StoreContext.Provider value={{
            wishlist,
            cart,
            addresses,
            selectedAddressId,
            toggleWishlist,
            isInWishlist,
            addToCart,
            removeFromCart,
            updateCartItem,
            removeFromWishlist,
            moveToWishlist,
            addAddress,
            updateAddress,
            deleteAddress,
            selectAddress,
            user,
            session,
            logout,
            placeOrder
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
}
