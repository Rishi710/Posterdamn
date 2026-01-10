"use client";

import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/context/StoreContext";

interface ProductProps {
    id: string | number;
    title: string;
    price: number;
    discountedPrice: number;
    image: string;
    sizes: string[];
    materials: string[];
    collectionName?: string;
    categoryName?: string;
}

export default function ProductCard({ product }: { product: ProductProps }) {
    const { toggleWishlist, isInWishlist, addToCart } = useStore();
    const isWishlisted = isInWishlist(product.id);

    // Get collection name if available, otherwise use a default
    const category = product.categoryName || product.collectionName || (typeof product.id === 'string' ? product.id.split('-')[0].toUpperCase().replace(/-/g, ' ') : "POSTERDAMN");

    return (
        <div className="group relative flex flex-col border border-zinc-100 bg-white transition-all hover:border-black dark:border-zinc-800 dark:bg-black dark:hover:border-white">
            {/* Image Container */}
            <div className="relative aspect-[2/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <Link href={`/shop/${product.id}`} className="block h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                </Link>

                {/* Wishlist Button */}
                <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-black shadow-lg transition-transform hover:scale-110 dark:bg-black dark:text-white"
                    aria-label="Toggle wishlist"
                >
                    <Heart
                        className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                        strokeWidth={2.5}
                    />
                </button>

                {/* Discount Badge */}
                {product.price > product.discountedPrice && (
                    <div className="absolute left-0 top-6 bg-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white dark:bg-white dark:text-black">
                        {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                    </div>
                )}
            </div>

            {/* Content / Footer */}
            <div className="flex flex-1 flex-col p-4 sm:p-6">
                <div className="mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {category}
                    </span>
                    <h3 className="mt-1 text-lg font-black tracking-tighter uppercase leading-tight text-black dark:text-white">
                        <Link href={`/shop/${product.id}`}>
                            {product.title}
                        </Link>
                    </h3>
                    <div className="mt-2 flex items-baseline gap-3">
                        <span className="text-xl font-black tracking-tight text-black dark:text-white">
                            ₹{product.discountedPrice}
                        </span>
                        {product.price > product.discountedPrice && (
                            <span className="text-sm font-bold text-zinc-500 line-through">
                                ₹{product.price}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => addToCart(product)}
                    className="mt-auto flex items-center justify-center gap-2 bg-black py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
