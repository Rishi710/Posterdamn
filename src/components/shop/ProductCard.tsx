"use client";

import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ProductProps {
    id: string | number;
    title: string;
    price: number;
    discountedPrice: number;
    image: string;
    sizes: string[];
    materials: string[];
}

export default function ProductCard({ product }: { product: ProductProps }) {
    const [isHovered, setIsHovered] = useState(false);
    const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);

    return (
        <div
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                <Link href={`/shop/${product.id}`} className="block aspect-[3/4] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                        loading="lazy"
                    />
                </Link>

                {/* Wishlist Button (Visible on Hover) */}
                <button
                    className={`absolute right-3 top-3 rounded-full bg-white p-2 text-gray-900 shadow-sm transition-all duration-300 hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                >
                    <Heart className="h-4 w-4" />
                </button>

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute left-3 top-3 rounded bg-black px-2 py-1 text-xs font-bold text-white dark:bg-white dark:text-black">
                        -{discount}%
                    </div>
                )}

                {/* 'Add to Cart' Button - Slides Up from Bottom */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
                    <button className="flex w-full items-center justify-center gap-2 rounded-md bg-black py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="mt-3 space-y-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    <Link href={`/shop/${product.id}`}>
                        {product.title}
                    </Link>
                </h3>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-black dark:text-white">
                        ₹{product.discountedPrice}
                    </span>

                    <span className="text-xs text-gray-500 line-through">
                        ₹{product.price}
                    </span>
                </div>

                {/* Minimal Tags */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.sizes.length} Sizes Available
                </p>
            </div>
        </div>
    );
}
