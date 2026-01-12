"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    TrendingDown,
    ArrowUpRight,
    Calendar,
    Package
} from "lucide-react";
import Link from "next/link";

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalProductsSold: number;
    revenueGrowth: number; // Placeholder
}

interface TopProduct {
    id: string;
    title: string;
    totalQuantity: number;
    totalRevenue: number;
}

export default function AdminAnalytics() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Fetch Orders for basic stats
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('total_amount, created_at');

            if (ordersError) throw ordersError;

            // 2. Fetch Order Items for product performance
            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('product_id, title, quantity, price');

            if (itemsError) throw itemsError;

            // Calculate basic stats
            const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0;
            const totalOrders = orders?.length || 0;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            const totalProductsSold = items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;

            setStats({
                totalRevenue,
                totalOrders,
                avgOrderValue,
                totalProductsSold,
                revenueGrowth: 12.5 // Mock growth
            });

            // Calculate top products
            const productMap: Record<string, TopProduct> = {};
            items?.forEach((item: any) => {
                if (!productMap[item.product_id]) {
                    productMap[item.product_id] = {
                        id: item.product_id,
                        title: item.title,
                        totalQuantity: 0,
                        totalRevenue: 0
                    };
                }
                const qty = item.quantity || 1;
                productMap[item.product_id].totalQuantity += qty;
                productMap[item.product_id].totalRevenue += (item.price * qty);
            });

            const sortedProducts = Object.values(productMap)
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 5);

            setTopProducts(sortedProducts);

        } catch (err) {
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-zinc-400 font-black uppercase tracking-widest animate-pulse">Calculating Metrics...</div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Analytics</h1>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">Performance & Insights</p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-sm border border-zinc-200 dark:border-zinc-800">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last 30 Days</span>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', color: 'text-green-500' },
                    { label: 'Total Orders', value: stats?.totalOrders, icon: ShoppingBag, trend: '+5.2%', color: 'text-zinc-500' },
                    { label: 'Avg Order Value', value: `₹${Math.round(stats?.avgOrderValue || 0)}`, icon: TrendingUp, trend: '-2.1%', color: 'text-red-500' },
                    { label: 'Units Sold', value: stats?.totalProductsSold, icon: Package, trend: '+8.4%', color: 'text-zinc-500' }
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 group hover:border-black dark:hover:border-white transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-sm">
                                <item.icon className="h-5 w-5 text-zinc-400" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                                {item.trend}
                            </span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{item.label}</h3>
                        <p className="text-3xl font-black italic tracking-tighter text-black dark:text-white">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Top Selling Products */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black italic tracking-tighter uppercase text-black dark:text-white">Top Performing Assets</h2>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Revenue Leaders by SKU</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-zinc-400" />
                    </div>

                    <div className="space-y-6">
                        {topProducts.map((product, i) => (
                            <div key={product.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-zinc-300">0{i + 1}</span>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-tight text-black dark:text-white group-hover:underline underline-offset-4 cursor-pointer">{product.title}</h4>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{product.totalQuantity} Units Sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black tracking-tight text-black dark:text-white">₹{product.totalRevenue.toLocaleString()}</span>
                                    <div className="h-1 bg-zinc-100 dark:bg-zinc-900 w-24 mt-1 overflow-hidden">
                                        <div
                                            className="h-full bg-black dark:bg-white"
                                            style={{ width: `${(product.totalRevenue / topProducts[0].totalRevenue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {topProducts.length === 0 && (
                            <div className="text-center py-10 text-xs font-bold uppercase tracking-widest text-zinc-400">
                                Insufficient data to calculate performance.
                            </div>
                        )}
                    </div>

                    <Link
                        href="/admin/inventory"
                        className="block w-full mt-10 py-4 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all text-center"
                    >
                        Expore Full Product Breakdown
                    </Link>
                </div>
            </div>
        </div>
    );
}
