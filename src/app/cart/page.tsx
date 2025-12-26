"use client";

import Link from "next/link";
import { Trash2, Heart, ChevronRight, ShoppingBag, Ticket, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useState } from "react";

export default function CartPage() {
    const { cart, removeFromCart, updateCartItem, moveToWishlist } = useStore();

    // Coupon State
    const [couponInput, setCouponInput] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [couponError, setCouponError] = useState("");
    const [isCouponApplied, setIsCouponApplied] = useState(false);

    const subtotal = cart.reduce((acc, item) => acc + item.discountedPrice, 0);
    const discountAmount = subtotal * appliedDiscount;
    const shipping = subtotal > 0 ? (subtotal > 1500 ? 0 : 99) : 0;
    const total = subtotal - discountAmount + shipping;

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        const code = couponInput.trim().toUpperCase();

        if (code === "POST10") {
            setAppliedDiscount(0.1);
            setIsCouponApplied(true);
            setCouponError("");
        } else {
            setCouponError("Invalid coupon code");
            setAppliedDiscount(0);
            setIsCouponApplied(false);
        }
    };

    const removeCoupon = () => {
        setAppliedDiscount(0);
        setIsCouponApplied(false);
        setCouponInput("");
        setCouponError("");
    };

    if (cart.length === 0) {
        return (
            <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-8">
                    <div className="rounded-full bg-zinc-50 p-12 dark:bg-zinc-900 transition-colors">
                        <ShoppingBag className="h-16 w-16 text-zinc-300 dark:text-zinc-700" strokeWidth={1} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-black dark:text-white lg:text-5xl">Your bag is empty</h1>
                        <p className="mt-4 text-base font-medium text-zinc-500 max-w-md mx-auto">
                            It looks like you haven&apos;t added any art to your collection yet. Start exploring our latest drops.
                        </p>
                    </div>
                    <Link
                        href="/shop"
                        className="bg-black px-12 py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-2xl"
                    >
                        Explore Collections
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12">
            <div className="mb-12 border-b border-zinc-100 dark:border-zinc-800 pb-12">
                <h1 className="text-4xl font-black italic tracking-tighter lg:text-6xl uppercase text-black dark:text-white">Shopping Bag</h1>
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mt-4">
                    Review your selection before checkout.
                </p>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
                {/* Cart Items */}
                <div className="lg:col-span-8 space-y-8">
                    {cart.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="group flex flex-col gap-6 border-b border-zinc-50 pb-8 dark:border-zinc-900 sm:flex-row">
                            <Link href={`/shop/${item.id}`} className="relative aspect-[2/3] w-32 flex-shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </Link>

                            <div className="flex flex-1 flex-col justify-between py-1">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Link href={`/shop/${item.id}`} className="hover:opacity-70 transition-opacity">
                                                <h3 className="text-xl font-black tracking-tighter uppercase text-black dark:text-white leading-none">
                                                    {item.title}
                                                </h3>
                                            </Link>
                                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                {typeof item.id === 'string' ? item.id.split('-')[0].replace(/-/g, ' ') : "POSTERDAMN"}
                                            </p>
                                        </div>
                                        <p className="text-xl font-black tracking-tight text-black dark:text-white">
                                            ₹{item.discountedPrice}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Size</span>
                                            <select
                                                value={item.sizes?.[0]}
                                                onChange={(e) => updateCartItem(index, { sizes: [e.target.value] })}
                                                className="text-xs font-bold uppercase text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 outline-none border-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all cursor-pointer"
                                            >
                                                {['A4', 'A3', 'A2'].map((size) => (
                                                    <option key={size} value={size}>{size}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Material</span>
                                            <select
                                                value={item.materials?.[0]}
                                                onChange={(e) => updateCartItem(index, { materials: [e.target.value] })}
                                                className="text-xs font-bold uppercase text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 outline-none border-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all cursor-pointer"
                                            >
                                                {['300 GSM Matte', '200 GSM Gloss', 'Sunboard', 'Premium Canvas'].map((material) => (
                                                    <option key={material} value={material}>{material}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-6">
                                    <button
                                        onClick={() => moveToWishlist(item, index)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-colors hover:text-black dark:hover:text-white"
                                    >
                                        <Heart className="h-3 w-3" />
                                        Move to Wishlist
                                    </button>
                                    <button
                                        onClick={() => removeFromCart(item.id, index)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-colors hover:text-red-500"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-16 lg:col-span-4 lg:mt-0">
                    <div className="sticky top-24 space-y-8 bg-zinc-50 p-8 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-black dark:text-white">Summary</h2>

                        {/* Coupon Section */}
                        <div className="space-y-4">
                            {!isCouponApplied ? (
                                <form onSubmit={handleApplyCoupon} className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <Ticket className="h-3 w-3" /> Promo Code
                                    </h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            placeholder="Enter Code (hint: POST10)"
                                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-xs font-bold uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-black dark:bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white dark:text-black hover:opacity-80 transition-opacity"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{couponError}</p>}
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Coupon Applied</h3>
                                    <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-4 py-3 border border-dashed border-zinc-300 dark:border-zinc-700">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="h-3 w-3 text-black dark:text-white" />
                                            <span className="text-xs font-black text-black dark:text-white uppercase tracking-widest">POST10 (10% OFF)</span>
                                        </div>
                                        <button onClick={removeCoupon} className="text-zinc-400 hover:text-red-500 transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 border-b border-zinc-200 pb-8 dark:border-zinc-800">
                            <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                                <span className="text-zinc-500">Subtotal</span>
                                <span className="text-black dark:text-white">₹{subtotal}</span>
                            </div>
                            {isCouponApplied && (
                                <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                                    <span className="text-zinc-500">Coupon Discount</span>
                                    <span className="text-zinc-600 dark:text-zinc-400">-₹{Math.round(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                                <span className="text-zinc-500">Shipping</span>
                                <span className="text-black dark:text-white">
                                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between text-xl font-black uppercase tracking-tighter">
                            <span className="text-black dark:text-white">Total</span>
                            <span className="text-black dark:text-white">₹{Math.round(total)}</span>
                        </div>

                        <button className="flex w-full items-center justify-center gap-2 bg-black py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                            Checkout
                            <ChevronRight className="h-4 w-4" strokeWidth={3} />
                        </button>

                        <div className="pt-4">
                            <p className="text-[10px] font-medium text-zinc-500 leading-relaxed text-center">
                                Complimentary shipping on orders above ₹1,500. <br />
                                Tax included. Secure payment processed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
