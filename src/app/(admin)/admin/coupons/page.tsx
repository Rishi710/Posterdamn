"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Ticket, Plus, Trash2, Check, X, Search, Calendar, RefreshCw } from "lucide-react";

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    usage_limit: number | null;
    used_count: number;
    expires_at: string | null;
    is_active: boolean;
}

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCode, setNewCode] = useState("");
    const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [newDiscountValue, setNewDiscountValue] = useState("");
    const [newExpiry, setNewExpiry] = useState("");
    const [newUsageLimit, setNewUsageLimit] = useState("");

    const fetchCoupons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setCoupons(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCoupons();
    }, [refreshTrigger]);

    const handleCreateCoupon = async () => {
        if (!newCode || !newDiscountValue) return;

        try {
            const payload: any = {
                code: newCode.toUpperCase(),
                discount_type: newDiscountType,
                discount_value: parseFloat(newDiscountValue),
                is_active: true
            };

            if (newExpiry) payload.expires_at = new Date(newExpiry).toISOString();
            if (newUsageLimit) payload.usage_limit = parseInt(newUsageLimit);

            const { error } = await supabase.from('coupons').insert(payload);

            if (error) throw error;

            // Reset
            setIsCreateOpen(false);
            setNewCode("");
            setNewDiscountType("percentage");
            setNewDiscountValue("");
            setNewExpiry("");
            setNewUsageLimit("");
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            alert("Error creating coupon: " + err.message);
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm("Delete this coupon permanently?")) return;
        await supabase.from('coupons').delete().eq('id', id);
        setRefreshTrigger(prev => prev + 1);
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Coupons</h1>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">Manage Promo Codes</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black py-4 px-8 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    Create New
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                        No active campaigns found. Create one to boost sales.
                    </div>
                )}

                {coupons.map((coupon) => (
                    <div key={coupon.id} className="group relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 transition-all hover:border-black dark:hover:border-white">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                    <Ticket className="h-5 w-5 text-zinc-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-black dark:text-white">{coupon.code}</h3>
                                    <span className={`inline-block px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="text-zinc-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-xs font-bold uppercase">
                                <span className="text-zinc-400">Discount</span>
                                <span className="text-black dark:text-white">
                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase">
                                <span className="text-zinc-400">Usage</span>
                                <span className="text-black dark:text-white">{coupon.used_count} / {coupon.usage_limit || '∞'}</span>
                            </div>
                            {coupon.expires_at && (
                                <div className="flex justify-between text-xs font-bold uppercase">
                                    <span className="text-zinc-400">Expires</span>
                                    <span className="text-red-500">{new Date(coupon.expires_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => toggleActive(coupon.id, coupon.is_active)}
                            className={`w-full py-3 text-[10px] font-black uppercase tracking-widest border transition-colors ${coupon.is_active
                                    ? 'border-zinc-200 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                    : 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                                }`}
                        >
                            {coupon.is_active ? 'Deactivate' : 'Activate Campaign'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 w-full max-w-lg p-8 shadow-2xl relative">
                        <button onClick={() => setIsCreateOpen(false)} className="absolute right-4 top-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full">
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8">Create Coupon</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Code</label>
                                <input
                                    type="text"
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                    placeholder="E.g. WELCOME20"
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 font-black uppercase tracking-widest outline-none border border-transparent focus:border-black dark:focus:border-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Type</label>
                                    <select
                                        value={newDiscountType}
                                        onChange={(e) => setNewDiscountType(e.target.value as 'percentage' | 'fixed')}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 font-bold text-xs outline-none appearance-none"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Value</label>
                                    <input
                                        type="number"
                                        value={newDiscountValue}
                                        onChange={(e) => setNewDiscountValue(e.target.value)}
                                        placeholder="20"
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 font-bold outline-none border border-transparent focus:border-black dark:focus:border-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={newExpiry}
                                        onChange={(e) => setNewExpiry(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 font-bold text-xs outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={newUsageLimit}
                                        onChange={(e) => setNewUsageLimit(e.target.value)}
                                        placeholder="Unlimited"
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 font-bold outline-none border border-transparent focus:border-black dark:focus:border-white transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreateCoupon}
                                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                            >
                                Generate Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
