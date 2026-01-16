"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Search, Mail, Phone, ShoppingBag, ExternalLink, ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface Customer {
    user_id: string;
    email: string;
    name: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
}

export default function AdminCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'recent'>('recent');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            // Fetch all orders with their addresses to get names/emails/amounts
            // In a larger system, we'd have a 'profiles' or 'customers' table.
            // For now, we aggregate from orders/addresses as requested/available.
            const { data: orders, error } = await supabase
                .from('orders')
                .select(`
                    user_id,
                    total_amount,
                    created_at,
                    addresses (name, phone)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Simple aggregation
            const customerMap: Record<string, Customer> = {};

            // We also need emails. Since we can't easily list auth.users from client without admin key,
            // we'll rely on names for now, or if we had profiles we'd join it.
            // Let's assume for now that for each order, we can at least see the UUID.

            orders?.forEach((order: any) => {
                const uid = order.user_id;
                if (!customerMap[uid]) {
                    customerMap[uid] = {
                        user_id: uid,
                        email: "User ID: " + uid.substring(0, 8) + "...", // Placeholder since email is in auth.users
                        name: order.addresses?.name || "Anonymous",
                        orderCount: 0,
                        totalSpent: 0,
                        lastOrder: order.created_at
                    };
                }

                customerMap[uid].orderCount += 1;
                customerMap[uid].totalSpent += parseFloat(order.total_amount);
                if (new Date(order.created_at) > new Date(customerMap[uid].lastOrder)) {
                    customerMap[uid].lastOrder = order.created_at;
                }
            });

            setCustomers(Object.values(customerMap));
        } catch (err) {
            console.error("Error fetching customers:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers
        .filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user_id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
            if (sortBy === 'orders') return b.orderCount - a.orderCount;
            return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime();
        });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8 gap-4">
                <div>
                    <h1 className="text-4xl tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Customers</h1>
                    <p className="text-sm text-zinc-500 uppercase tracking-widest mt-2">Insights & Order History</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="SEARCH NAME/ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-11 pr-6 py-4 text-[10px] uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                {[
                    { label: 'Most Recent', value: 'recent' },
                    { label: 'Top Spenders', value: 'spent' },
                    { label: 'Frequent Buyers', value: 'orders' }
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setSortBy(tab.value as any)}
                        className={`px-6 py-3 text-[10px] uppercase tracking-widest transition-all border ${sortBy === tab.value
                            ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <th className="py-6 px-6 text-[10px] uppercase tracking-widest text-zinc-400">Customer Info</th>
                            <th className="py-6 px-4 text-[10px] uppercase tracking-widest text-zinc-400">Order Stats</th>
                            <th className="py-6 px-4 text-[10px] uppercase tracking-widest text-zinc-400">Total Spent</th>
                            <th className="py-6 px-4 text-[10px] uppercase tracking-widest text-zinc-400">Last Seen</th>
                            <th className="py-6 px-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="py-8 px-6 bg-zinc-50/50 dark:bg-zinc-900/10"></td>
                                </tr>
                            ))
                        ) : filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 px-6 text-center text-xs uppercase tracking-widest text-zinc-400">
                                    No customers found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.user_id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <td className="py-6 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center rounded-sm group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors border border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                                                <Users className="h-5 w-5 text-zinc-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm uppercase tracking-tight text-black dark:text-white leading-none mb-1">
                                                    {customer.name}
                                                </h3>
                                                <p className="text-[10px] text-zinc-400 break-all">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-zinc-400" />
                                            <span className="text-sm text-black dark:text-white">{customer.orderCount} Orders</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex flex-col">
                                            <span className="text-lg tracking-tighter text-black dark:text-white">
                                                ₹{customer.totalSpent.toLocaleString()}
                                            </span>
                                            <span className="text-[9px] text-zinc-400 uppercase tracking-widest underline decoration-zinc-200 dark:decoration-zinc-800 underline-offset-4">Premium Value</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <span className="text-[10px] uppercase tracking-widest">
                                                {new Date(customer.lastOrder).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-right">
                                        <Link
                                            href={`/admin/orders?user=${customer.user_id}`}
                                            className="inline-flex items-center justify-center p-3 text-zinc-400 hover:text-black dark:hover:text-white transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                                            title="View Order History"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
