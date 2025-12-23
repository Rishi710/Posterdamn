"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Product {
    id: string | number;
    title: string;
    price: number;
    discountedPrice: number;
    image: string;
    sizes?: string[];
    materials?: string[];
}

interface StoreContextType {
    wishlist: Product[];
    cart: Product[];
    toggleWishlist: (product: Product) => void;
    isInWishlist: (id: string | number) => boolean;
    addToCart: (product: Product) => void;
    removeFromCart: (id: string | number, index?: number) => void;
    updateCartItem: (index: number, updates: Partial<Product>) => void;
    removeFromWishlist: (id: string | number) => void;
    moveToWishlist: (product: Product, index?: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [cart, setCart] = useState<Product[]>([]);

    // Persist to localStorage
    useEffect(() => {
        const savedWishlist = localStorage.getItem("wishlist");
        const savedCart = localStorage.getItem("cart");
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

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
            // Fallback for when index isn't provided
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

    return (
        <StoreContext.Provider value={{
            wishlist,
            cart,
            toggleWishlist,
            isInWishlist,
            addToCart,
            removeFromCart,
            updateCartItem,
            removeFromWishlist,
            moveToWishlist
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
