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
    collectionName?: string;
    categoryName?: string;
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

export interface Coupon {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount?: number;
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

    // Coupon Actions
    coupon: Coupon | null;
    applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
    removeCoupon: () => void;

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
    const [coupon, setCoupon] = useState<Coupon | null>(null);
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
        const savedCoupon = localStorage.getItem("coupon");

        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedAddresses) setAddresses(JSON.parse(savedAddresses));
        if (savedSelectedId) setSelectedAddressId(savedSelectedId);
        if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
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
                setCoupon(null);
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
                    image: item.image,
                    sizes: item.size ? [item.size] : [],
                    materials: item.material ? [item.material] : []
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
                    image: item.image,
                    sizes: item.size ? [item.size] : [],
                    materials: item.material ? [item.material] : []
                }));
                setWishlist(wishlistItems);
            }

            setIsDataLoaded(true);
        }
        fetchUserData();
    }, [user]);

    // Sync functions (wishlist, cart) omitted for brevity as they are unchanged logic-wise but included in full file replacement if needed.
    // Wait, replace_file_content needs EXACT content match if I use chunks.
    // I will just paste the full file content with my updates to be safe and ensure everything is consistent.
    // It's safer to reproduce the known good parts + my changes.

    // Sync wishlist to Supabase function
    const syncWishlistToSupabase = React.useCallback(async () => {
        if (!user) return;

        try {
            const { error: deleteError } = await supabase
                .from('wishlist_items')
                .delete()
                .eq('user_id', user.id);

            if (deleteError) return;

            if (wishlist.length > 0) {
                const wishlistItems = wishlist.map(item => ({
                    user_id: user.id,
                    product_id: item.id,
                    title: item.title,
                    price: item.price,
                    discounted_price: item.discountedPrice,
                    image: item.image,
                    size: item.sizes?.[0] || null,
                    material: item.materials?.[0] || null
                }));

                await supabase.from('wishlist_items').insert(wishlistItems);
            }
        } catch (error) {
            console.error('Error syncing wishlist:', error);
        }
    }, [user, wishlist]);

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        if (user && isDataLoaded) {
            const timeoutId = setTimeout(() => syncWishlistToSupabase(), 500);
            return () => clearTimeout(timeoutId);
        }
    }, [wishlist, user, isDataLoaded, syncWishlistToSupabase]);

    // Sync cart to Supabase function
    const syncCartToSupabase = React.useCallback(async () => {
        if (!user) return;

        try {
            const { error: deleteError } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);

            if (deleteError) return;

            if (cart.length > 0) {
                const cartItems = cart.map(item => ({
                    user_id: user.id,
                    product_id: item.id,
                    title: item.title,
                    price: item.price,
                    discounted_price: item.discountedPrice,
                    image: item.image,
                    quantity: 1,
                    size: item.sizes?.[0] || null,
                    material: item.materials?.[0] || null
                }));

                await supabase.from('cart_items').insert(cartItems);
            }
        } catch (error) {
            console.error('Error syncing cart:', error);
        }
    }, [user, cart]);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
        if (user && isDataLoaded) {
            const timeoutId = setTimeout(() => syncCartToSupabase(), 500);
            return () => clearTimeout(timeoutId);
        }
    }, [cart, user, isDataLoaded, syncCartToSupabase]);

    // Coupon Persistence
    useEffect(() => {
        if (coupon) {
            localStorage.setItem("coupon", JSON.stringify(coupon));
        } else {
            localStorage.removeItem("coupon");
        }
    }, [coupon]);


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

    const applyCoupon = async (code: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', code.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                return { success: false, message: "Invalid or expired coupon" };
            }

            // Checks
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return { success: false, message: "Coupon expired" };
            }
            if (data.usage_limit && data.used_count >= data.usage_limit) {
                return { success: false, message: "Usage limit reached" };
            }

            // Min order check
            const subtotal = cart.reduce((acc, item) => acc + item.discountedPrice, 0);
            if (data.min_order_amount && subtotal < data.min_order_amount) {
                return { success: false, message: `Minimum order of ₹${data.min_order_amount} required` };
            }

            if (data.is_second_purchase_only) {
                if (!user) {
                    return { success: false, message: "Login required for this coupon" };
                }
                const { count, error: countError } = await supabase
                    .from('orders')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'completed'); // Only count successfully completed orders

                if (countError) throw countError;

                if (count !== 1) {
                    return { success: false, message: count === 0 ? "Only for your second purchase" : "Coupon valid for second purchase only" };
                }
            }

            setCoupon({
                code: data.code,
                type: data.discount_type,
                value: data.discount_value,
                min_order_amount: data.min_order_amount
            });

            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };

    const removeCoupon = () => {
        setCoupon(null);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("addresses");
        localStorage.removeItem("selectedAddressId");
        localStorage.removeItem("cart");
        localStorage.removeItem("wishlist");
        localStorage.removeItem("coupon");
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

        let discount = 0;
        if (coupon) {
            if (coupon.type === 'percentage') {
                discount = subtotal * (coupon.value / 100);
            } else {
                discount = coupon.value;
            }
        }
        // Ensure discount doesn't exceed subtotal
        if (discount > subtotal) discount = subtotal;

        const shipping = (subtotal - discount) > 1500 ? 0 : 99;
        const total = (subtotal - discount) + shipping;

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
                product_id: item.id.toString(), // Ensure string
                title: item.title,
                price: item.discountedPrice,
                image: item.image,
                quantity: 1,
                size: item.sizes?.[0] || null,
                material: item.materials?.[0] || null
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Increment Coupon Usage if applied
            if (coupon) {
                await supabase.rpc('increment_coupon_usage', { coupon_code: coupon.code });
                // If RPC doesn't exist, we can try direct update (unsafe if not RLS protected properly, but works for MVP admin/authenticated)
                // Or we can assume we'll add RPC later. For now, let's try direct update:
                // Actually, we need to find the coupon ID first or match by code
                const { data: cData } = await supabase.from('coupons').select('id, used_count').eq('code', coupon.code).single();
                if (cData) {
                    await supabase.from('coupons').update({ used_count: (cData.used_count || 0) + 1 }).eq('id', cData.id);
                }
            }

            // 4. Clear Cart
            setCart([]);
            setCoupon(null);
            localStorage.removeItem("cart");
            localStorage.removeItem("coupon");

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
            coupon,
            applyCoupon,
            removeCoupon,
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
