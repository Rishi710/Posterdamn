"use client";

import React, { useEffect, useState } from "react";
import { Package, ChevronRight, Clock, CheckCircle2, Truck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/context/StoreContext";
import Link from "next/link";

interface OrderItem {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
}

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    payment_method: string;
    order_items: OrderItem[];
}

export default function OrdersPage() {
    const { user } = useStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("orders")
                .select(`
                    *,
                    order_items (*)
                `)
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;

        try {
            setCancellingOrderId(orderId);
            const { error } = await supabase
                .from("orders")
                .update({ status: "cancelled" })
                .eq("id", orderId)
                .eq("user_id", user?.id);

            if (error) throw error;

            // Update local state
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: "cancelled" } : order
            ));
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert("Failed to cancel order. Please try again.");
        } finally {
            setCancellingOrderId(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending": return <Clock className="h-4 w-4 text-amber-500" />;
            case "shipped": return <Truck className="h-4 w-4 text-blue-500" />;
            case "delivered": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "cancelled": return <AlertCircle className="h-4 w-4 text-red-500" />;
            default: return <AlertCircle className="h-4 w-4 text-zinc-400" />;
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-black dark:text-white lg:text-4xl">Order History</h1>
                <p className="mt-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Track and manage your archival collections</p>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl">
                    <Package className="h-12 w-12 text-zinc-200 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-zinc-400">No orders found</p>
                    <Link href="/shop" className="mt-6 text-xs font-black uppercase tracking-widest text-black dark:text-white underline underline-offset-8">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="group overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-black dark:hover:border-white transition-all">
                            {/* Order Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 p-6 bg-zinc-50/50 dark:bg-zinc-900/80">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order ID</p>
                                        <p className="text-xs font-black text-black dark:text-white mt-1">#{order.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Placed On</p>
                                        <p className="text-xs font-black text-black dark:text-white mt-1">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total</p>
                                        <p className="text-xs font-black text-black dark:text-white mt-1">₹{order.total_amount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 px-4 py-1.5">
                                    {getStatusIcon(order.status)}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">{order.status}</span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="h-16 w-12 flex-shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black">
                                                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black uppercase tracking-tight text-black dark:text-white truncate">{item.title}</p>
                                                <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-black dark:text-white">₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Cancel Button - Only for pending orders */}
                                {order.status.toLowerCase() === "pending" && (
                                    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                        <button
                                            onClick={() => cancelOrder(order.id)}
                                            disabled={cancellingOrderId === order.id}
                                            className="w-full sm:w-auto px-6 py-3 text-xs font-black uppercase tracking-widest text-red-500 border border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {cancellingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
