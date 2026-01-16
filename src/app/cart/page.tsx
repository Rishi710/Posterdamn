"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Heart, ChevronRight, ShoppingBag, Ticket, X, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
    const { cart, removeFromCart, updateCartItem, moveToWishlist, coupon, applyCoupon, removeCoupon } = useStore();

    // Coupon State
    const [couponInput, setCouponInput] = useState("");
    const [couponError, setCouponError] = useState("");
    const [loadingCoupon, setLoadingCoupon] = useState(false);

    // Initial Coupon Code population if exists
    useEffect(() => {
        if (coupon) {
            setCouponInput(coupon.code);
        }
    }, [coupon]);

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setCouponError("");
        if (!couponInput.trim()) return;

        setLoadingCoupon(true);
        const result = await applyCoupon(couponInput);
        setLoadingCoupon(false);

        if (!result.success) {
            setCouponError(result.message || "Invalid coupon");
        } else {
            setCouponError(""); // Clear error on success
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setCouponInput("");
        setCouponError("");
    };

    // Calculate totals
    const subtotal = cart.reduce((acc, item) => {
        const price = item.discountedPrice || item.price;
        return acc + price;
    }, 0);

    let discountAmount = 0;
    if (coupon) {
        if (coupon.type === 'percentage') {
            discountAmount = subtotal * (coupon.value / 100);
        } else {
            discountAmount = coupon.value;
        }
    }
    // Cap discount at subtotal
    if (discountAmount > subtotal) discountAmount = subtotal;

    const shipping = (subtotal - discountAmount) > 1500 ? 0 : 99;
    const total = (subtotal - discountAmount) + shipping;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex items-center justify-center pt-20">
                <div className="text-center space-y-6 max-w-md px-6">
                    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-zinc-400" />
                    </div>
                    <h1 className="text-3xl tracking-tighter uppercase">Your Cart is Empty</h1>
                    <p className="text-zinc-500 font-medium">Looks like you haven't added any posters yet. Time to decorate your walls?</p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-8 py-4 uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12 border-b border-zinc-100 dark:border-zinc-800 pb-12">
                    <h1 className="text-4xl md:text-6xl tracking-tighter uppercase mb-2">
                        Your Cart <span className="text-zinc-300 dark:text-zinc-800">({cart.length})</span>
                    </h1>
                    <p className="text-sm uppercase tracking-widest text-zinc-500 mt-4">
                        Review your selection before checkout.
                    </p>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-6">
                        <AnimatePresence mode='popLayout'>
                            {cart.map((item, index) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={`${item.id}-${index}`}
                                    className="group relative flex gap-6 p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-black dark:hover:border-white transition-colors"
                                >
                                    {/* Image */}
                                    <div className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg sm:text-xl uppercase tracking-tight leading-none">
                                                    {item.title}
                                                </h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id, index)}
                                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-sm">
                                                    {item.sizes?.[0] || 'A3 (Standard)'}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-sm">
                                                    {item.materials?.[0] || '300 GSM Matte'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between mt-4">
                                            {/* Quantity (Static 1 for now as per logic, can be enhanced) */}
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => moveToWishlist(item, index)}
                                                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-400 transition-colors hover:text-black dark:hover:text-white"
                                                >
                                                    <Heart className="h-3 w-3" />
                                                    Save for Later
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                {item.discountedPrice < item.price && (
                                                    <span className="block text-xs text-zinc-400 line-through">
                                                        ₹{item.price}
                                                    </span>
                                                )}
                                                <span className="text-lg">
                                                    ₹{item.discountedPrice || item.price}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 mt-12 lg:mt-0">
                        <div className="sticky top-32 space-y-6">
                            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6">
                                <h2 className="text-xl tracking-tighter uppercase mb-6">Order Summary</h2>

                                <div className="space-y-4 text-sm mb-8">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500 font-medium">Subtotal</span>
                                        <span>₹{subtotal.toFixed(0)}</span>
                                    </div>

                                    {coupon && (
                                        <div className="flex justify-between text-green-600 dark:text-green-500 animate-in slide-in-from-left-2">
                                            <span className="font-medium flex items-center gap-1.5">
                                                <Ticket className="w-3 h-3" />
                                                Discount ({coupon.code})
                                            </span>
                                            <span>-₹{discountAmount.toFixed(0)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-zinc-500 font-medium">Shipping</span>
                                        <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                    </div>

                                    {shipping > 0 && (
                                        <div className="text-xs text-zinc-400">
                                            Add items worth ₹{(1500 - (subtotal - discountAmount)).toFixed(0)} more for free shipping
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-end">
                                        <span className="uppercase tracking-wider text-base">Total</span>
                                        <span className="text-2xl">₹{total.toFixed(0)}</span>
                                    </div>
                                </div>

                                {/* Coupon Input */}
                                <div className="mb-8">
                                    <h3 className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                                        <Ticket className="h-3 w-3" /> Promo Code
                                    </h3>
                                    <form onSubmit={handleApplyCoupon} className="relative">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            placeholder="ENTER CODE"
                                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 pr-12 text-sm uppercase tracking-wider placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                            disabled={!!coupon}
                                        />
                                        {coupon ? (
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={loadingCoupon || !couponInput.trim()}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-50 transition-colors"
                                            >
                                                {loadingCoupon ? (
                                                    <span className="w-4 h-4 block border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
                                                ) : (
                                                    <ArrowRight className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </form>
                                    {couponError && (
                                        <p className="text-xs text-red-500 mt-2 uppercase tracking-wide animate-in slide-in-from-top-1">
                                            {couponError}
                                        </p>
                                    )}
                                    {coupon && (
                                        <p className="text-xs text-green-600 dark:text-green-500 mt-2 uppercase tracking-wide animate-in slide-in-from-top-1">
                                            Coupon Applied!
                                        </p>
                                    )}
                                </div>

                                <Link
                                    href="/checkout"
                                    className="block w-full bg-black text-white dark:bg-white dark:text-black py-4 text-center uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout
                                    <ChevronRight className="h-4 w-4" strokeWidth={3} />
                                </Link>

                                <p className="text-[10px] text-center text-zinc-400 font-medium uppercase tracking-widest mt-4">
                                    Secure Checkout • Free Returns
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
