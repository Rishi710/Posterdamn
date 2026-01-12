"use client";

import React, { useState } from "react";
import {
    Settings,
    Store,
    Globe,
    Truck,
    Shield,
    Smartphone,
    Mail,
    AlertCircle,
    Save,
    CheckCircle2,
    Database,
    Zap
} from "lucide-react";

export default function AdminSettings() {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaving(true);
        // Simulate save
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1500);
    };

    return (
        <div className="max-w-4xl space-y-12">
            <div className="flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Settings</h1>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">Configuration & Preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black py-4 px-8 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95 disabled:opacity-50"
                >
                    {saving ? (
                        <Zap className="h-4 w-4 animate-spin" />
                    ) : saved ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : saved ? "Changes Saved" : "Save Changes"}
                </button>
            </div>

            {/* Store Profile Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-black dark:text-white" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">Store Profile</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl shadow-black/5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Public Store Name</label>
                        <input
                            type="text"
                            defaultValue="POSTERDAMN"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Support Email Address</label>
                        <input
                            type="email"
                            defaultValue="hello@posterdamn.shop"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Business Phone</label>
                        <input
                            type="text"
                            defaultValue="+91 98765 43210"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Support Working Hours</label>
                        <input
                            type="text"
                            defaultValue="Mon-Sat, 10AM - 7PM"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* SEO & Marketing */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-black dark:text-white" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">SEO & Keywords</h2>
                </div>

                <div className="space-y-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl shadow-black/5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Page Title Prefix</label>
                        <input
                            type="text"
                            defaultValue="Posterdamn | Rare Collectible Posters"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Meta Description</label>
                        <textarea
                            rows={3}
                            defaultValue="Premium quality minimalist posters for modern spaces. Curated collections of art, typography, and vintage aesthetics."
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-medium outline-none focus:ring-1 ring-black dark:ring-white transition-all resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Instagram Handle</label>
                            <input
                                type="text"
                                defaultValue="@posterdamn"
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Twitter (X) Handle</label>
                            <input
                                type="text"
                                defaultValue="@posterdamn_art"
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Inventory & Shipping Rules */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-black dark:text-white" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">Fulfillment & Stock</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl shadow-black/5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Free Shipping Min Order (₹)</label>
                        <input
                            type="number"
                            defaultValue="1500"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Standard Delivery Fee (₹)</label>
                        <input
                            type="number"
                            defaultValue="99"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Low Stock Alert Level</label>
                        <input
                            type="number"
                            defaultValue="5"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Est. Delivery Time (Days)</label>
                        <input
                            type="text"
                            defaultValue="5 - 7 Days"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 ring-black dark:ring-white transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* System Information */}
            <section className="space-y-6 pb-12">
                <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-black dark:text-white" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">System Environment</h2>
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Database</p>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Supabase Connected</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">App Runtime</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Next.js 16.0.10</span>
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Security</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">RLS Enabled</span>
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Platform Version</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">v0.1.4-beta</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
