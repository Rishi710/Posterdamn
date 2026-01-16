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
        customers: 0,
        revenueTrend: null as number | null,
        ordersTrend: null as number | null
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState("Admin");
    const [greeting, setGreeting] = useState("Welcome back");

    const getGreetingTime = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const fetchData = async () => {
        try {
            setLoading(true);

            // 0. User Info
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Admin";
                // Capitalize first letter
                const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
                setAdminName(formattedName);
            }
            setGreeting(getGreetingTime());

            // Date Ranges
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString();
            const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)).toISOString();

            // 1. Fetch Orders (Last 60 Days for trends)
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('total_amount, created_at, user_id')
                .gte('created_at', sixtyDaysAgo); // Optimization: only fetch what we need for trends

            if (ordersError) console.error("Dashboard: Orders fetch error:", ordersError);

            // 2. Fetch All Lifetime Orders (for Total Revenue/count) if needed, 
            // OR just use the 60d data if "Total" refers to recent. 
            // *correction*: Dashboard usually shows Lifetime totals. 
            // Let's do a separate cheap query for totals if we want lifetime accuracy, 
            // or just sum everything if the shop is new.
            // For robust trends + lifetime totals, we might need two queries or one big one.
            // Let's stick to the existing behavior: All-time totals.

            const { data: allOrders, error: allOrdersError } = await supabase
                .from('orders')
                .select('total_amount, user_id'); // Full scan for totals

            // Metrics Calculation
            const totalRevenue = allOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
            const totalOrders = allOrders?.length || 0;
            const uniqueCustomers = new Set(allOrders?.map(o => o.user_id)).size;

            // Trend Calculation (30d vs previous 30d)
            const currentOrders = ordersData?.filter(o => o.created_at >= thirtyDaysAgo) || [];
            const previousOrders = ordersData?.filter(o => o.created_at < thirtyDaysAgo) || [];

            const calcRev = (os: any[]) => os.reduce((sum, o) => sum + Number(o.total_amount), 0);

            const revCur = calcRev(currentOrders);
            const revPrev = calcRev(previousOrders);
            const ordCur = currentOrders.length;
            const ordPrev = previousOrders.length;

            const calcTrend = (cur: number, prev: number) => {
                if (prev === 0) return null;
                return ((cur - prev) / prev) * 100;
            };

            // 3. Products Count
            const { count: productsCount } = await supabase
                .from('products')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true);

            setStats({
                revenue: totalRevenue,
                orders: totalOrders,
                activeStock: productsCount || 0,
                customers: uniqueCustomers,
                revenueTrend: calcTrend(revCur, revPrev),
                ordersTrend: calcTrend(ordCur, ordPrev)
            });

            // 4. Recent Orders List
            const { data: recent } = await supabase
                .from('orders')
                .select(`id, total_amount, status, created_at, user_id`)
                .order('created_at', { ascending: false })
                .limit(5);

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
                    } catch {
                        return { ...order, customerName: 'Customer' };
                    }
                }));
                // Set recent orders only if mounted
                setRecentOrders(enrichedOrders);
            }

        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const subscription = supabase
            .channel('dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <div className="space-y-12 relative">
            {/* Background Texture */}
            <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Greeting & Quick Summary */}
            <section className="relative">
                <div className="mb-6 lg:mb-10 flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6 lg:pb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500">{greeting}</p>
                        </div>
                        <h1 className="text-3xl tracking-tighter lg:text-7xl uppercase text-black dark:text-white leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-600">
                                Hi, {adminName}.
                            </span>
                        </h1>
                        <p className="text-sm text-zinc-500 uppercase tracking-widest mt-4 max-w-lg">
                            Here's what's happening in your store today. Global operations are active.
                        </p>
                    </div>
                    {loading && <Activity className="h-6 w-6 animate-spin text-black dark:text-white" />}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats.revenue.toLocaleString()}`}
                        trend={stats.revenueTrend}
                        icon={TrendingUp}
                        detail="Lifetime"
                        delay={0}
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats.orders}
                        trend={stats.ordersTrend}
                        icon={ShoppingBag}
                        detail="Processed"
                        delay={100}
                    />
                    <StatCard
                        title="Active Stock"
                        value={stats.activeStock}
                        trend={null}
                        icon={Package}
                        detail="SKUs online"
                        delay={200}
                    />
                    <StatCard
                        title="Customers"
                        value={stats.customers}
                        trend={null}
                        icon={Users}
                        detail="Unique"
                        delay={300}
                    />
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Recent Orders - Taking 2 cols */}
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <h3 className="text-[10px] lg:text-xs uppercase tracking-[0.3em] text-zinc-400">Mission Registry / Recent Orders</h3>
                        <Link href="/admin/orders" className="text-[10px] uppercase tracking-widest text-black dark:text-white border-b border-black dark:border-white hover:opacity-70 transition-opacity">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {recentOrders.length === 0 && !loading && (
                            <div className="p-8 text-center border dashed border-zinc-200 dark:border-zinc-800">
                                <p className="text-sm text-zinc-500">No orders yet. Ready for launch.</p>
                            </div>
                        )}
                        {recentOrders.map((order, i) => (
                            <div key={order.id}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-5 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-0.5 gap-4"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex items-center gap-4 lg:gap-5">
                                    <div className="h-10 w-10 lg:h-12 lg:w-12 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center rounded-sm group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                        <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 opacity-50 group-hover:opacity-100" />
                                    </div>
                                    <div>
                                        <p className="text-xs lg:text-sm text-black dark:text-white uppercase tracking-tight group-hover:underline">
                                            {order.id.split('-')[0]}
                                        </p>
                                        <p className="text-[10px] uppercase text-zinc-400 mt-1">
                                            {order.customerName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto border-t sm:border-t-0 border-zinc-100 dark:border-zinc-900 pt-3 sm:pt-0">
                                    <span className="text-xs lg:text-sm text-black dark:text-white">₹{order.total_amount}</span>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${order.status === 'completed' ? 'border-green-200 text-green-600 bg-green-50' :
                                            order.status === 'pending' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' :
                                                'border-zinc-200 text-zinc-500 bg-zinc-50'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <span className="text-[8px] text-zinc-400 uppercase flex items-center gap-1">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Analytics - Taking 1 col */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-400">Live Telemetry</h3>
                        <Activity className="h-3 w-3 animate-pulse text-green-500" />
                    </div>

                    <div className="bg-black dark:bg-white text-white dark:text-black p-8 rounded-sm shadow-2xl flex flex-col items-center justify-center space-y-4 hover:scale-[1.02] transition-transform duration-500 cursor-default">
                        <TrendingUp className="h-12 w-12 opacity-50" />
                        <div className="text-center">
                            <p className="text-4xl tracking-tighter">
                                ₹{stats.orders > 0 ? Math.round(stats.revenue / stats.orders) : 0}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest opacity-60 mt-2">Avg. Order Value</p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="h-10 w-10 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-black dark:group-hover:border-white group-hover:text-black dark:group-hover:text-white transition-all">
                                <Package className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-xs uppercase text-black dark:text-white">Inventory Status</h4>
                                <p className="text-[10px] text-zinc-400">Manage your collections and stock.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon: Icon, detail, delay }: any) {
    const isPositive = trend !== null && trend >= 0;

    return (
        <div
            className="group relative bg-white dark:bg-zinc-950 p-6 border border-zinc-100 dark:border-zinc-800 transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-1 overflow-hidden"
            style={{ animation: `fadeInUp 0.6s ease-out ${delay}ms both` }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <ArrowUpRight className="h-4 w-4 text-zinc-300" />
            </div>

            <div className="flex items-start justify-between mb-6">
                <div className="h-12 w-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center rounded-sm group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300">
                    <Icon className="h-5 w-5 text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors" />
                </div>
                {trend !== null ? (
                    <div className={`flex items-center text-[10px] px-2 py-1 rounded-full ${isPositive ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                ) : (
                    <div className="text-[8px] text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-full">
                        Live
                    </div>
                )}
            </div>
            <div>
                <p className="text-4xl tracking-tighter text-black dark:text-white group-hover:scale-105 origin-left transition-transform duration-300">{value}</p>
                <div className="flex items-center gap-2 mt-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">{title}</p>
                    <span className="h-0.5 w-0.5 rounded-full bg-zinc-300" />
                    <p className="text-[8px] uppercase text-zinc-400">{detail}</p>
                </div>
            </div>
        </div>
    );
}
