"use client";

import React, { useEffect, useState } from "react";
import {
    TrendingUp,
    ShoppingBag,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    CreditCard,
    Activity,
    Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        activeStock: 0,
        customers: 0 // We'll just count unique users from orders for now or 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log("AdminDashboard: Starting data fetch...");

            // 1. Stats
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('total_amount, user_id');

            if (ordersError) {
                console.error("Dashboard: Orders fetch error:", {
                    message: ordersError.message,
                    details: ordersError.details,
                    hint: ordersError.hint,
                    code: ordersError.code
                });
            }

            const { count: productsCount, error: productsError } = await supabase
                .from('products')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true);

            if (productsError) {
                console.error("Dashboard: Products fetch error:", productsError);
            }

            const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
            const totalOrders = ordersData?.length || 0;
            const uniqueCustomers = new Set(ordersData?.map(o => o.user_id)).size;

            setStats({
                revenue: totalRevenue,
                orders: totalOrders,
                activeStock: productsCount || 0,
                customers: uniqueCustomers
            });

            // 2. Recent Orders
            const { data: recent, error: recentError } = await supabase
                .from('orders')
                .select(`id, total_amount, status, created_at, user_id`)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentError) {
                console.error("Dashboard: Recent orders fetch error:", recentError);
            }

            if (recent) {
                const enrichedOrders = await Promise.all(recent.map(async (order) => {
                    try {
                        const { data: address } = await supabase
                            .from('addresses')
                            .select('name')
                            .eq('user_id', order.user_id)
                            .limit(1)
                            .single();
                        return { ...order, customerName: address?.name || 'Customer' };
                    } catch (err) {
                        console.error("Dashboard: Single address enrichment error:", err);
                        return { ...order, customerName: 'Customer' };
                    }
                }));
                setRecentOrders(enrichedOrders);
            }
        } catch (err) {
            console.error("CRITICAL DASHBOARD FETCH ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Realtime Subscription
        const subscription = supabase
            .channel('dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                console.log('Realtime update:', payload);
                fetchData(); // Refresh all stats on any order change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <div className="space-y-12">
            {/* Greeting & Quick Summary */}
            <section>
                <div className="mb-10 flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-10">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Dashboard</h1>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">Global Operations Control</p>
                    </div>
                    {loading && <Activity className="h-6 w-6 animate-spin text-black dark:text-white" />}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats.revenue.toLocaleString()}`}
                        change="+0%" // Todo: calculate real growth
                        isPositive={true}
                        icon={TrendingUp}
                        detail="Lifetime"
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats.orders}
                        change="+0%"
                        isPositive={true}
                        icon={ShoppingBag}
                        detail="Processed"
                    />
                    <StatCard
                        title="Active Stock"
                        value={stats.activeStock}
                        change="Live"
                        isPositive={true}
                        icon={Package}
                        detail="SKUs online"
                    />
                    <StatCard
                        title="Customers"
                        value={stats.customers}
                        change="Live"
                        isPositive={true}
                        icon={Users}
                        detail="Unique"
                    />
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Orders - Taking 2 cols */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Mission Registry / Recent Orders</h3>
                        <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white border-b border-black dark:border-white hover:opacity-70">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {recentOrders.length === 0 && !loading && (
                            <p className="text-sm text-zinc-500 italic">No orders yet.</p>
                        )}
                        {recentOrders.map((order) => (
                            <div key={order.id} className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all cursor-crosshair">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 opacity-50" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-black dark:text-white uppercase tracking-tight">
                                            {order.id.split('-')[0]}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase text-zinc-400">
                                            {order.customerName} • ₹{order.total_amount}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase mt-1 flex items-center gap-1">
                                        <Clock className="h-2 w-2" />
                                        {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Analytics - Taking 1 col */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Live Telemetry</h3>
                        <Activity className="h-3 w-3 animate-pulse text-green-500" />
                    </div>

                    <div className="bg-black text-white p-8 rounded-none border border-zinc-800 flex flex-col items-center justify-center space-y-4 shadow-2xl">
                        <TrendingUp className="h-12 w-12 opacity-20" />
                        <div className="text-center">
                            <p className="text-3xl font-black italic tracking-tighter">100%</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Uptime</p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Inventory Health</h4>
                        {/* Placeholder for now */}
                        <p className="text-xs text-zinc-400">Detailed category analytics coming soon.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, isPositive, icon: Icon, detail }: any) {
    return (
        <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/2">
            <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-zinc-400" />
                </div>
                <div className={`flex items-center text-[10px] font-black ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {change}
                </div>
            </div>
            <div>
                <p className="text-3xl font-black italic tracking-tighter text-black dark:text-white">{value}</p>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</p>
                    <span className="h-1 w-1 rounded-full bg-zinc-200" />
                    <p className="text-[8px] font-bold uppercase text-zinc-500">{detail}</p>
                </div>
            </div>
        </div>
    );
}
