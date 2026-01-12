"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Clock, Download, Filter, Search, Eye, ChevronLeft, ChevronRight, X, User, Package } from "lucide-react";
import Link from "next/link";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Assuming you have shadcn dialog or similar?
// Wait, I don't know if they have shadcn/ui Dialog component installed.
// I will build a simple custom modal or reuse existing patterns if available.
// Looking at previous cues, I built a custom Delete Modal. I can build a custom Order Details Modal.

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;
    const [totalParsed, setTotalParsed] = useState(0); // Supabase count

    // Realtime
    const fetchOrders = async () => {
        setLoading(true);
        const from = (page - 1) * PER_PAGE;
        const to = from + PER_PAGE - 1;

        let query = supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (searchQuery) {
            // Note: Searching UUIDs or amounts is tricky.
            // Search implementation depends on what we want to search.
            // For now, let's assume search is client-side or ID exact match if we really need it.
            // Supabase allows text search if we set it up.
            // But 'orders' has user_id, not name.
            // Let's keep it simple: no search details strictly yet or just by ID.
            if (searchQuery.includes("-")) {
                query = query.ilike('id', `%${searchQuery}%`);
            }
        }

        const { data, count, error } = await query;

        if (error) {
            console.error("Error fetching orders:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            alert(`Failed to fetch orders: ${error.message}`);
        } else {
            // Fetch User Names for these orders (N+1 problem but manageable for 10 items)
            const enriched = await Promise.all((data || []).map(async (order) => {
                const { data: address } = await supabase
                    .from('addresses')
                    .select('name')
                    .eq('user_id', order.user_id)
                    .limit(1)
                    .single();
                return { ...order, customerName: address?.name || 'Customer' };
            }));

            setOrders(enriched);
            setTotalParsed(count || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();

        // Subscribe to changes
        const subscription = supabase
            .channel('orders-page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [page, searchQuery]);

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);

    const openOrderDetails = async (order: any) => {
        setSelectedOrder(order);
        setLoadingItems(true);
        // Fetch Items
        const { data } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

        setOrderItems(data || []);
        setLoadingItems(false);
    };

    const updateStatus = async (status: string) => {
        if (!selectedOrder) return;
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', selectedOrder.id);

        if (!error) {
            // Update local state immediately for responsiveness
            setOrders((prev: any[]) => prev.map(o => o.id === selectedOrder.id ? { ...o, status } : o));
            setSelectedOrder((prev: any) => ({ ...prev, status }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-8 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-black dark:text-white lg:text-5xl">Orders</h1>
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                        Manage and fulfill customer orders
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchOrders} className="bg-black px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 dark:bg-white dark:text-black hover:opacity-80 transition-opacity">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">ID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Total</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Payment</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
                                        <td className="px-6 py-6"><div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
                                        <td className="px-6 py-6"><div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
                                        <td className="px-6 py-6"><div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
                                        <td className="px-6 py-6"><div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
                                        <td className="px-6 py-6"><div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
                                        <td className="px-6 py-6"></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">No orders found</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{order.id.split('-')[0]}</td>
                                        <td className="px-6 py-4 font-bold text-black dark:text-white uppercase tracking-tight text-xs">{order.customerName}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            <span className="block text-[10px] opacity-60">
                                                {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-black dark:text-white">₹{order.total_amount}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                                {order.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openOrderDetails(order)}
                                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors border p-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Page {page} of {Math.ceil(totalParsed / PER_PAGE)} ({totalParsed} items)
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </button>
                        <button
                            disabled={page >= Math.ceil(totalParsed / PER_PAGE)}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal (Inline Custom Implementation) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="border-b border-zinc-100 dark:border-zinc-800 p-6 flex justify-between items-start sticky top-0 bg-white dark:bg-black z-10">
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase">Order #{selectedOrder.id.split('-')[0]}</h2>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                    {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Customer & Status */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Customer</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                            <User className="h-4 w-4 text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold uppercase">{selectedOrder.customerName}</p>
                                            <p className="text-xs text-zinc-500">ID: {selectedOrder.user_id}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Update Status</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => updateStatus(s)}
                                                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-colors ${selectedOrder.status === s
                                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                                    : 'border-zinc-200 text-zinc-500 hover:border-black hover:text-black dark:border-zinc-800 dark:hover:border-white dark:hover:text-white'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Items Ordered</h3>
                                <div className="space-y-4">
                                    {loadingItems ? (
                                        <p className="text-sm text-zinc-500">Loading items...</p>
                                    ) : (
                                        orderItems.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 border-b border-zinc-50 dark:border-zinc-900 pb-4 last:border-0 last:pb-0">
                                                <div className="h-16 w-12 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="text-sm font-bold uppercase">{item.title}</h4>
                                                            <div className="flex gap-3 mt-1">
                                                                <p className="text-[10px] font-bold text-zinc-500 uppercase">Size: {item.size || 'N/A'}</p>
                                                                <p className="text-[10px] font-bold text-zinc-500 uppercase">Mat: {item.material || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-black">₹{item.price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500 font-medium">Subtotal</span>
                                    <span className="font-bold">₹{selectedOrder.total_amount}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black uppercase tracking-tighter mt-4">
                                    <span>Total Paid</span>
                                    <span>₹{selectedOrder.total_amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };

    // @ts-ignore
    const cn = styles[status] || "bg-zinc-100 text-zinc-500";

    return (
        <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${cn}`}>
            {status}
        </span>
    );
}
