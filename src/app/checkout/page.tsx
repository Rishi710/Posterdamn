"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, MapPin, Edit2, Check, Trash2 } from "lucide-react";
import { useStore, Address } from "@/context/StoreContext";

export default function CheckoutPage() {
    const { cart, addresses, selectedAddressId, addAddress, updateAddress, deleteAddress, selectAddress } = useStore();
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Omit<Address, "id">>({
        name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        zip: "",
        phone: ""
    });

    const subtotal = cart.reduce((acc, item) => acc + item.discountedPrice, 0);
    // Note: Re-calculating discount logic here since it's locally handled in Cart. 
    // In a real app, this should be in context. For this demo, we'll assume POST10 is applied if valid.
    const discount = 0; // Placeholder
    const shipping = subtotal > 1500 ? 0 : 99;
    const total = subtotal - discount + shipping;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAddressId) {
            updateAddress(editingAddressId, formData);
            setEditingAddressId(null);
        } else {
            addAddress(formData);
            setIsAddingNew(false);
        }
        setFormData({ name: "", line1: "", line2: "", city: "", state: "", zip: "", phone: "" });
    };

    const handleEdit = (addr: Address) => {
        setFormData({ ...addr });
        setEditingAddressId(addr.id);
        setIsAddingNew(true);
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 bg-white dark:bg-black min-h-screen">
            {/* Header */}
            <div className="mb-12 flex items-center gap-4">
                <Link href="/cart" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Bag
                </Link>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-black dark:text-white lg:text-5xl">Checkout</h1>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
                {/* Left Column: Address Management */}
                <div className="lg:col-span-8 space-y-12">
                    <section>
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-8">
                            <h2 className="text-xl font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs text-white dark:bg-white dark:text-black">1</span>
                                Shipping Address
                            </h2>
                            {!isAddingNew && (
                                <button
                                    onClick={() => {
                                        setEditingAddressId(null);
                                        setFormData({ name: "", line1: "", line2: "", city: "", state: "", zip: "", phone: "" });
                                        setIsAddingNew(true);
                                    }}
                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black dark:text-white hover:opacity-50 transition-opacity"
                                >
                                    <Plus className="h-4 w-4" /> Add New
                                </button>
                            )}
                        </div>

                        {isAddingNew ? (
                            <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-zinc-900 p-8 border border-zinc-100 dark:border-zinc-800 space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">
                                    {editingAddressId ? "Edit Address" : "New Shipping Address"}
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <FormInput label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="John Doe" />
                                    <FormInput label="Phone Number" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} placeholder="9876543210" />
                                    <div className="sm:col-span-2">
                                        <FormInput label="Address Line 1" value={formData.line1} onChange={(v) => setFormData({ ...formData, line1: v })} placeholder="House No, Street Name" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <FormInput label="Address Line 2 (Optional)" value={formData.line2 || ""} onChange={(v) => setFormData({ ...formData, line2: v })} placeholder="Apartment, Landmark" />
                                    </div>
                                    <FormInput label="City" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} placeholder="Indore" />
                                    <FormInput label="State" value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} placeholder="Madhya Pradesh" />
                                    <FormInput label="ZIP / Postal Code" value={formData.zip} onChange={(v) => setFormData({ ...formData, zip: v })} placeholder="452001" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="flex-1 bg-black py-4 text-xs font-black uppercase tracking-widest text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity">
                                        {editingAddressId ? "Update Address" : "Save Address"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingNew(false)}
                                        className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {addresses.length === 0 ? (
                                    <div className="sm:col-span-2 flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                                        <MapPin className="h-10 w-10 text-zinc-300 mb-4" />
                                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest text-center px-4">No addresses saved yet</p>
                                        <button
                                            onClick={() => setIsAddingNew(true)}
                                            className="mt-4 text-xs font-black uppercase text-black dark:text-white underline underline-offset-4"
                                        >
                                            Add your first address
                                        </button>
                                    </div>
                                ) : (
                                    addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => selectAddress(addr.id)}
                                            className={`group relative cursor-pointer border-2 p-5 transition-all ${selectedAddressId === addr.id ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300">
                                                    {selectedAddressId === addr.id && <div className="h-2.5 w-2.5 rounded-full bg-black dark:bg-white" />}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(addr); }}
                                                        className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                                                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black uppercase tracking-tight text-black dark:text-white">{addr.name}</p>
                                            <p className="mt-1 text-xs font-medium text-zinc-500 leading-relaxed">
                                                {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.zip}
                                            </p>
                                            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">{addr.phone}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>

                    <section className="opacity-50 pointer-events-none">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-8">
                            <h2 className="text-xl font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">2</span>
                                Payment Method
                            </h2>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-8 text-center text-xs font-bold uppercase tracking-widest text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                            Complete address selection to choose payment
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="mt-16 lg:col-span-4 lg:mt-0">
                    <div className="sticky top-24 space-y-8 bg-zinc-50 p-8 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4">Order Summary</h2>

                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="h-16 w-12 flex-shrink-0 bg-white dark:bg-black overflow-hidden border border-zinc-100 dark:border-zinc-800">
                                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black uppercase tracking-tight text-black dark:text-white truncate">{item.title}</p>
                                        <p className="text-[10px] font-bold text-zinc-400">Qty: 1</p>
                                        <p className="mt-1 text-xs font-black text-black dark:text-white">₹{item.discountedPrice}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                            <SummaryRow label="Subtotal" value={`₹${subtotal}`} />
                            <SummaryRow label="Shipping" value={shipping === 0 ? "FREE" : `₹${shipping}`} />
                            <div className="flex justify-between text-xl font-black uppercase tracking-tighter pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                <span className="text-black dark:text-white">Total</span>
                                <span className="text-black dark:text-white">₹{Math.round(total)}</span>
                            </div>
                        </div>

                        <button
                            disabled={!selectedAddressId}
                            className={`flex w-full items-center justify-center gap-2 py-5 text-sm font-black uppercase tracking-[0.2em] transition-all ${selectedAddressId ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-xs font-bold text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
            />
        </div>
    );
}

function SummaryRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
            <span className="text-zinc-500">{label}</span>
            <span className="text-black dark:text-white">{value}</span>
        </div>
    );
}
