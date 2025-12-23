"use client";

import { useState, use } from "react";
import { products, collections } from "@/data/mockData";
import { ArrowLeft, Check, Heart, Minus, Plus, Share2, Star, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useStore } from "@/context/StoreContext";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use() for Next.js 15
    const resolvedParams = use(params);
    const { toggleWishlist, isInWishlist, addToCart } = useStore();

    const product = products.find((p) => p.id === resolvedParams.id);

    if (!product) {
        notFound();
    }

    // State for selections
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [selectedMaterial, setSelectedMaterial] = useState(product.materials[0]);
    const [quantity, setQuantity] = useState(1);

    const isWishlisted = isInWishlist(product.id);

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

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart({
                ...product,
                discountedPrice: currentPrice,
                price: originalPrice,
                sizes: [selectedSize],
                materials: [selectedMaterial]
            });
        }
    };

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
                        <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image}
                                alt={product.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <button
                            onClick={() => toggleWishlist(product)}
                            className="absolute right-4 top-4 rounded-full bg-white p-3 shadow-lg transition-transform hover:scale-110 active:scale-95 dark:bg-zinc-800 dark:text-white border border-zinc-100 dark:border-zinc-700"
                            aria-label="Toggle wishlist"
                        >
                            <Heart className={`h-6 w-6 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                    </div>

                    {/* Right Column: Key Details */}
                    <div className="mt-10 px-0 sm:mt-16 sm:px-0 lg:mt-0">
                        {/* Title & Reviews */}
                        <div className="mb-2">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                {product.id.split('-')[0].replace(/-/g, ' ')}
                            </p>
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-black dark:text-white lg:text-5xl leading-none">
                            {product.title}
                        </h1>

                        <div className="mt-4 flex items-center gap-4">
                            <div className="flex items-center text-yellow-400">
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                            </div>
                            <span className="text-sm font-bold text-zinc-500">4.9 (128 Reviews)</span>
                        </div>

                        {/* Pricing */}
                        <div className="mt-8 flex items-baseline gap-4">
                            <span className="text-5xl font-black tracking-tighter text-black dark:text-white">
                                ₹{currentPrice}
                            </span>
                            <span className="text-2xl text-zinc-400 line-through font-bold">
                                ₹{originalPrice}
                            </span>
                            <span className="bg-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white dark:bg-white dark:text-black">
                                {discount}% OFF
                            </span>
                        </div>
                        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Inclusive of all taxes</p>

                        {/* Selectors */}
                        <div className="mt-10 space-y-10">
                            {/* Size Selector */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Select Size</h3>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors border-b border-zinc-400">Size Guide</button>
                                </div>
                                <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`flex items-center justify-center border py-4 text-xs font-black uppercase tracking-widest transition-all ${selectedSize === size ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-xl shadow-black/10 dark:shadow-white/5' : 'border-zinc-200 text-zinc-500 hover:border-black hover:text-black dark:border-zinc-800 dark:hover:border-white dark:hover:text-white'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Material Selector */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Material</h3>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {product.materials.map((material) => (
                                        <button
                                            key={material}
                                            onClick={() => setSelectedMaterial(material)}
                                            className={`flex w-full items-center justify-between border px-6 py-4 transition-all ${selectedMaterial === material ? 'border-black bg-black/5 dark:border-white dark:bg-white/5 ring-1 ring-black dark:ring-white' : 'border-zinc-200 hover:border-black dark:border-zinc-800 dark:hover:border-white'}`}
                                        >
                                            <span className={`text-[10px] uppercase tracking-widest font-black ${selectedMaterial === material ? 'text-black dark:text-white' : 'text-zinc-500'}`}>
                                                {material}
                                            </span>
                                            {selectedMaterial === material && <Check className="h-4 w-4 text-black dark:text-white" strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                            {/* Quantity */}
                            <div className="flex items-center border border-zinc-200 dark:border-zinc-800 px-2 py-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-4 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" strokeWidth={3} />
                                </button>
                                <span className="w-12 text-center text-lg font-black tracking-tight text-black dark:text-white">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-4 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    <Plus className="h-4 w-4" strokeWidth={3} />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-black px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                                Add to Cart - ₹{currentPrice * quantity}
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
