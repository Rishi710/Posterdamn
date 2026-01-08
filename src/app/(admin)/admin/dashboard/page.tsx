"use client";

import React from "react";
import {
    TrendingUp,
    ShoppingBag,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    CreditCard,
    Activity
} from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="space-y-12">
            {/* Greeting & Quick Summary */}
            <section>
                <div className="mb-10 flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-10">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Dashboard</h1>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">Global Operations Control</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value="₹1,24,500"
                        change="+12.5%"
                        isPositive={true}
                        icon={TrendingUp}
                        detail="vs last month"
                    />
                    <StatCard
                        title="Total Orders"
                        value="482"
                        change="+18.2%"
                        isPositive={true}
                        icon={ShoppingBag}
                        detail="Processed"
                    />
                    <StatCard
                        title="Active Stock"
                        value="124"
                        change="-2.4%"
                        isPositive={false}
                        icon={Package}
                        detail="SKUs online"
                    />
                    <StatCard
                        title="New Customers"
                        value="+54"
                        change="+4.1%"
                        isPositive={true}
                        icon={Users}
                        detail="This week"
                    />
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Orders - Taking 2 cols */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Mission Registry / Recent Orders</h3>
                        <button className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white border-b border-black dark:border-white">View All</button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all cursor-crosshair">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 opacity-50" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-black dark:text-white">ORD-240{i}1</p>
                                        <p className="text-[10px] font-bold uppercase text-zinc-400">Abhiroop S. • ₹1,299</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded">Pending</span>
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase mt-1">2 mins ago</span>
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
                            <p className="text-3xl font-black italic tracking-tighter">84.2%</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sell-through Rate</p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Popular Categories</h4>
                        <div className="space-y-4">
                            <CategoryStat name="Abstract Minimal" count={45} percent={75} />
                            <CategoryStat name="Brutalist Architecture" count={32} percent={60} />
                            <CategoryStat name="Retro Archive" count={28} percent={45} />
                        </div>
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

function CategoryStat({ name, count, percent }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span>{name}</span>
                <span className="text-zinc-400">{count} items</span>
            </div>
            <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-900">
                <div className="h-full bg-black dark:bg-white" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}
