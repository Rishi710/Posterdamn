"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Printer, ShoppingBag } from "lucide-react";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("id");

    return (
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-12 bg-white dark:bg-black min-h-screen flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
                <CheckCircle2 className="relative h-24 w-24 text-green-500" />
            </div>

            <h1 className="text-4xl tracking-tighter uppercase text-black dark:text-white lg:text-6xl mb-4">
                Manifest Confirmed
            </h1>
            <p className="text-sm text-zinc-500 uppercase tracking-[0.3em] mb-12">
                Order #{orderId?.slice(-8).toUpperCase() || "SUCCESS"}
            </p>

            <div className="max-w-md w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 mb-12 space-y-6 text-left">
                <div className="flex items-start gap-4">
                    <Package className="h-5 w-5 text-black dark:text-white mt-1" />
                    <div>
                        <p className="text-xs uppercase tracking-widest text-black dark:text-white">Processing Shipment</p>
                        <p className="text-[10px] font-medium text-zinc-500 leading-relaxed mt-1">
                            Your posters are being prepared for archival-quality packaging. We will alert you once the courier is dispatched.
                        </p>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[10px] uppercase tracking-widest">
                    <span className="text-zinc-400">Estimated Delivery</span>
                    <span className="text-black dark:text-white">3-5 Business Days</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Link
                    href="/account/orders"
                    className="flex-1 bg-black py-5 text-[10px] uppercase tracking-widest text-white dark:bg-white dark:text-black hover:opacity-80 transition-all flex items-center justify-center gap-2"
                >
                    View Status <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                    href="/"
                    className="flex-1 border border-black dark:border-white py-5 text-[10px] uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-2"
                >
                    Back to Archive
                </Link>
            </div>

            <div className="mt-12 flex items-center gap-2 text-[8px] text-zinc-400 uppercase tracking-widest opacity-50">
                <ShoppingBag className="h-3 w-3" />
                SECURE TRANSACTION RECORDED • POSTERDAMN TERMINAL
            </div>
        </div>
    );
}
