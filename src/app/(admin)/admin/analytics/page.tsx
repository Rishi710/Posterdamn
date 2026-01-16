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
    revenueTrend: number | null;
    ordersTrend: number | null;
    aovTrend: number | null;
    unitsTrend: number | null;
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
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString();
            const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)).toISOString();

            // 1. Fetch Orders for the last 60 days
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('total_amount, created_at')
                .gte('created_at', sixtyDaysAgo);

            if (ordersError) throw ordersError;

            // 2. Fetch Order Items for the last 60 days
            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('product_id, title, quantity, price, created_at')
                .gte('created_at', sixtyDaysAgo);

            if (itemsError) throw itemsError;

            // Split into Current (0-30 days) and Previous (31-60 days)
            const currentOrders = orders?.filter(o => o.created_at >= thirtyDaysAgo) || [];
            const previousOrders = orders?.filter(o => o.created_at < thirtyDaysAgo) || [];

            const currentItems = items?.filter(i => i.created_at >= thirtyDaysAgo) || [];
            const previousItems = items?.filter(i => i.created_at < thirtyDaysAgo) || [];

            // Metrics Calculation
            const calcRev = (os: any[]) => os.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
            const calcUnits = (is: any[]) => is.reduce((sum, i) => sum + (i.quantity || 1), 0);

            const revCur = calcRev(currentOrders);
            const revPrev = calcRev(previousOrders);

            const ordCur = currentOrders.length;
            const ordPrev = previousOrders.length;

            const aovCur = ordCur > 0 ? revCur / ordCur : 0;
            const aovPrev = ordPrev > 0 ? revPrev / ordPrev : 0;

            const unitsCur = calcUnits(currentItems);
            const unitsPrev = calcUnits(previousItems);

            // Trend Calculation Helper
            const calcTrend = (cur: number, prev: number) => {
                if (prev === 0) return null; // Return null for "New" state instead of 100%
                return ((cur - prev) / prev) * 100;
            };

            setStats({
                totalRevenue: revCur,
                totalOrders: ordCur,
                avgOrderValue: aovCur,
                totalProductsSold: unitsCur,
                revenueTrend: calcTrend(revCur, revPrev),
                ordersTrend: calcTrend(ordCur, ordPrev),
                aovTrend: calcTrend(aovCur, aovPrev),
                unitsTrend: calcTrend(unitsCur, unitsPrev)
            });

            // Calculate top products from CURRENT period items
            const productMap: Record<string, TopProduct> = {};
            currentItems.forEach((item: any) => {
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
                productMap[item.product_id].totalRevenue += (parseFloat(item.price) * qty);
            });

            const sortedProducts = Object.values(productMap)
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 5);

            setTopProducts(sortedProducts);

        } catch (err: any) {
            console.error("Analytics fetch error:", err);
            alert(`Analytics fetch error: ${err.message || JSON.stringify(err)}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-zinc-400 uppercase tracking-widest animate-pulse">Calculating Metrics...</div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-4xl tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Analytics</h1>
                    <p className="text-sm text-zinc-500 uppercase tracking-widest mt-2">Performance & Insights</p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-sm border border-zinc-200 dark:border-zinc-800">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">Last 30 Days</span>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: stats?.revenueTrend || 0 },
                    { label: 'Total Orders', value: stats?.totalOrders, icon: ShoppingBag, trend: stats?.ordersTrend || 0 },
                    { label: 'Avg Order Value', value: `₹${Math.round(stats?.avgOrderValue || 0)}`, icon: TrendingUp, trend: stats?.aovTrend || 0 },
                    { label: 'Units Sold', value: stats?.totalProductsSold, icon: Package, trend: stats?.unitsTrend || 0 }
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 group hover:border-black dark:hover:border-white transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-sm">
                                <item.icon className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] uppercase tracking-widest ${item.trend === null ? "text-zinc-400" :
                                item.trend >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                {item.trend === null ? (
                                    <span>Start</span>
                                ) : (
                                    <>
                                        {item.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {Math.abs(item.trend).toFixed(1)}%
                                    </>
                                )}
                            </div>
                        </div>
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">{item.label}</h3>
                        <p className="text-3xl tracking-tighter text-black dark:text-white">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Top Selling Products */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl tracking-tighter uppercase text-black dark:text-white">Top Performing Assets</h2>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Revenue Leaders by SKU</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-zinc-400" />
                    </div>

                    <div className="space-y-6">
                        {topProducts.map((product, i) => (
                            <div key={product.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-zinc-300">0{i + 1}</span>
                                    <div>
                                        <h4 className="text-xs uppercase tracking-tight text-black dark:text-white group-hover:underline underline-offset-4 cursor-pointer">{product.title}</h4>
                                        <p className="text-[8px] text-zinc-400 uppercase tracking-widest">{product.totalQuantity} Units Sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm tracking-tight text-black dark:text-white">₹{product.totalRevenue.toLocaleString()}</span>
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
                            <div className="text-center py-10 text-xs uppercase tracking-widest text-zinc-400">
                                Insufficient data to calculate performance.
                            </div>
                        )}
                    </div>

                    <Link
                        href="/admin/inventory"
                        className="block w-full mt-10 py-4 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all text-center"
                    >
                        Expore Full Product Breakdown
                    </Link>
                </div>
            </div>
        </div>
    );
}
