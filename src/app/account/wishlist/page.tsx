"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, Heart } from "lucide-react";

interface WishlistItem {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
}

const INITIAL_WISHLIST: WishlistItem[] = [
    {
        id: "1",
        name: "CYBERPUNK DYSTOPIA",
        price: "₹1,299",
        image: "https://loremflickr.com/400/600/cyberpunk,city",
        category: "RETRO FUTURE",
    },
    {
        id: "2",
        name: "NEON DREAMS",
        price: "₹1,499",
        image: "https://loremflickr.com/400/600/neon,abstract",
        category: "ABSTRACT",
    },
    {
        id: "3",
        name: "MINIMALIST ZEN",
        price: "₹999",
        image: "https://loremflickr.com/400/600/minimalist,art",
        category: "MINIMAL",
    },
];

import { useStore } from "@/context/StoreContext";

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, addToCart } = useStore();

    const handleRemove = (id: string | number) => {
        removeFromWishlist(id);
    };

    const handleAddToCart = (product: any) => {
        addToCart(product);
        console.log(`Adding item ${product.id} to cart`);
    };

    if (wishlist.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 text-center">
                <div className="rounded-full bg-zinc-50 p-8 dark:bg-zinc-900">
                    <Heart className="h-12 w-12 text-zinc-300 dark:text-zinc-700" strokeWidth={1} />
                </div>
                <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-black dark:text-white">Your wishlist is empty</h2>
                    <p className="text-sm font-medium text-zinc-500 mt-2">Start adding the art that speaks to you.</p>
                </div>
                <Link
                    href="/shop"
                    className="bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    Explore Collections
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <h1 className="text-3xl font-black italic tracking-tighter lg:text-4xl uppercase text-black dark:text-white">Wishlist</h1>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">Items you&apos;ve saved for later.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {wishlist.map((item) => (
                    <div
                        key={item.id}
                        className="group relative flex flex-col border border-zinc-100 bg-white transition-all hover:border-black dark:border-zinc-800 dark:bg-black dark:hover:border-white"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-[2/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                            />

                            {/* Remove Button */}
                            <button
                                onClick={() => handleRemove(item.id)}
                                className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-black shadow-lg transition-transform hover:scale-110 dark:bg-black dark:text-white"
                                aria-label="Remove from wishlist"
                            >
                                <X className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col p-6 bg-black">
                            <div className="mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    {typeof item.id === 'string' ? item.id.split('-')[0].toUpperCase().replace(/-/g, ' ') : "POSTERDAMN"}
                                </span>
                                <h3 className="mt-1 text-lg font-black tracking-tighter uppercase leading-tight text-white">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-xl font-black tracking-tight text-white">₹{item.discountedPrice}</p>
                            </div>

                            <button
                                onClick={() => handleAddToCart(item)}
                                className="mt-auto flex items-center justify-center gap-2 bg-white py-4 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-zinc-200"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
