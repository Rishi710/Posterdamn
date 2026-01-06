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
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    phone: string;
    isDefault?: boolean;
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
    addAddress: (address: Omit<Address, "id">) => void;
    updateAddress: (id: string, updates: Partial<Address>) => void;
    deleteAddress: (id: string) => void;
    selectAddress: (id: string) => void;

    // Auth Actions
    user: User | null;
    session: Session | null;
    logout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [cart, setCart] = useState<Product[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);

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

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

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

    // Address Management
    const addAddress = (addressData: Omit<Address, "id">) => {
        const newAddress: Address = {
            ...addressData,
            id: Math.random().toString(36).substr(2, 9)
        };
        setAddresses(prev => [...prev, newAddress]);
        if (!selectedAddressId) setSelectedAddressId(newAddress.id);
    };

    const updateAddress = (id: string, updates: Partial<Address>) => {
        setAddresses(prev => prev.map(addr => addr.id === id ? { ...addr, ...updates } : addr));
    };

    const deleteAddress = (id: string) => {
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        if (selectedAddressId === id) setSelectedAddressId(null);
    };

    const selectAddress = (id: string) => {
        setSelectedAddressId(id);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
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
            logout
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
