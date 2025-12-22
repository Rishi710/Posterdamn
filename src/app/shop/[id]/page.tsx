"use client";

import { useState, use } from "react";
import { products, collections } from "@/data/mockData";
import { ArrowLeft, Check, Heart, Minus, Plus, Share2, Star, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use() for Next.js 15
    const resolvedParams = use(params);

    const product = products.find((p) => p.id === resolvedParams.id);

    if (!product) {
        notFound();
    }

    // State for selections
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [selectedMaterial, setSelectedMaterial] = useState(product.materials[0]);
    const [quantity, setQuantity] = useState(1);

    // Calculate pricing changes based on size (Mock Logic)
    // In a real app, price would come from a variant object
    const getPriceMultiplier = (size: string) => {
        switch (size) {
            case 'A4': return 1;
            case 'A3': return 1.5;
            case 'A2': return 2.5;
            default: return 1;
        }
    };

    const currentPrice = Math.round(product.discountedPrice * getPriceMultiplier(selectedSize));
    const originalPrice = Math.round(product.price * getPriceMultiplier(selectedSize));
    const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100 bg-gray-50/50 py-4 dark:border-gray-800 dark:bg-zinc-900/30">
                <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 text-sm text-gray-500 sm:px-6 lg:px-8">
                    <Link href="/" className="hover:text-black dark:hover:text-white">Home</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-black dark:hover:text-white">Shop</Link>
                    <span>/</span>
                    <span className="line-clamp-1 font-medium text-black dark:text-white">{product.title}</span>
                </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                    {/* Left Column: Image Gallery */}
                    <div className="product-image-container relative">
                        <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image}
                                alt={product.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <button className="absolute right-4 top-4 rounded-full bg-white p-3 shadow-lg transition-transform hover:scale-110 active:scale-95 dark:bg-zinc-800 dark:text-white">
                            <Heart className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Right Column: Key Details */}
                    <div className="mt-10 px-0 sm:mt-16 sm:px-0 lg:mt-0">
                        {/* Title & Reviews */}
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            {product.title}
                        </h1>

                        <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center text-yellow-400">
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">4.9 (128 Reviews)</span>
                        </div>

                        {/* Pricing */}
                        <div className="mt-8 flex items-baseline gap-4">
                            <span className="text-4xl font-black text-gray-900 dark:text-white">
                                ₹{currentPrice}
                            </span>
                            <span className="text-xl text-gray-400 line-through">
                                ₹{originalPrice}
                            </span>
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                {discount}% OFF
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Inclusive of all taxes</p>

                        {/* Selectors */}
                        <div className="mt-10 space-y-8">
                            {/* Size Selector */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Select Size</h3>
                                    <button className="text-sm font-medium text-blue-600 hover:underline">Size Guide</button>
                                </div>
                                <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`flex items-center justify-center rounded-lg border py-3 text-sm font-bold uppercase sm:flex-1 ${selectedSize === size ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-zinc-800'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Material Selector */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Material</h3>
                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {product.materials.map((material) => (
                                        <button
                                            key={material}
                                            onClick={() => setSelectedMaterial(material)}
                                            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 ${selectedMaterial === material ? 'border-blue-600 ring-1 ring-blue-600 dark:border-blue-500 dark:ring-blue-500' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-zinc-800'}`}
                                        >
                                            <span className={`text-sm ${selectedMaterial === material ? 'font-bold text-blue-600 dark:text-blue-400' : 'font-medium text-gray-900 dark:text-gray-100'}`}>
                                                {material}
                                            </span>
                                            {selectedMaterial === material && <Check className="h-4 w-4 text-blue-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            {/* Quantity */}
                            <div className="flex items-center rounded-full border border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-4 hover:text-blue-600 disabled:opacity-50"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-4 hover:text-blue-600"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <button className="flex-1 rounded-full bg-black px-8 py-4 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-1 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                Add {quantity} to Cart - ₹{currentPrice * quantity}
                            </button>
                        </div>

                        {/* Delivery Info */}
                        <div className="mt-8 flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            <Truck className="h-5 w-5" />
                            <span>Free delivery on orders over ₹999. Estimated delivery by <b>Dec 25</b>.</span>
                        </div>

                        {/* Description */}
                        <div className="mt-10 border-t border-gray-200 pt-10 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Description</h3>
                            <div className="mt-4 prose prose-sm text-gray-500 dark:text-gray-400">
                                <p>{product.description}</p>
                                <ul className="mt-4 list-disc pl-5 space-y-1">
                                    <li>High-quality digital print</li>
                                    <li>Fade-resistant ink</li>
                                    <li>Securely packaged in a rigid tube</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
