"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";

interface Address {
    id: string;
    type: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
    {
        id: "1",
        type: "Home",
        name: "Abhiroop Singh",
        street: "45 Art District, Creative Avenue",
        city: "Indore",
        state: "Madhya Pradesh",
        zip: "452001",
        phone: "+91 98765 43210",
        isDefault: true,
    },
];

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => setIsAdding(true);
    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter lg:text-4xl uppercase text-black dark:text-white">Addresses</h1>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">Manage your delivery locations.</p>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-black px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        <Plus className="h-3 w-3" strokeWidth={3} />
                        Add New
                    </button>
                )}
            </div>

            {(isAdding || editingId) ? (
                <section className="mx-auto max-w-2xl bg-zinc-50/50 p-8 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-xl font-black italic tracking-tighter mb-8 uppercase text-black dark:text-white">
                        {editingId ? "Edit Address" : "New Address"}
                    </h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <InputGroup label="Address Type" placeholder="e.g. Home, Work" />
                            <InputGroup label="Full Name" placeholder="Abhiroop Singh" />
                        </div>
                        <InputGroup label="Street Address" placeholder="123 Street Name" />
                        <div className="grid grid-cols-2 gap-6">
                            <InputGroup label="City" placeholder="Indore" />
                            <InputGroup label="State" placeholder="Madhya Pradesh" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <InputGroup label="ZIP Code" placeholder="452001" />
                            <InputGroup label="Phone" placeholder="+91 98765 43210" />
                        </div>
                        <div className="flex items-center gap-4 pt-4">
                            <button className="flex-1 bg-black py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                                Save Address
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex-1 border border-zinc-200 py-4 text-xs font-black uppercase tracking-widest transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </section>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className="group flex flex-col justify-between border border-zinc-100 bg-white p-6 transition-all hover:border-black dark:border-zinc-800 dark:bg-black dark:hover:border-white"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:bg-zinc-900">
                                        {address.type}
                                    </span>
                                    {address.isDefault && (
                                        <span className="text-[10px] font-black tracking-widest text-black dark:text-white uppercase italic">Default</span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-lg font-black tracking-tighter uppercase text-black dark:text-white">{address.name}</h4>
                                    <p className="mt-1 text-sm font-medium text-zinc-500 leading-relaxed">
                                        {address.street}<br />
                                        {address.city}, {address.state} {address.zip}<br />
                                        {address.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-4 border-t border-zinc-50 pt-6 dark:border-zinc-800">
                                <button
                                    onClick={() => setEditingId(address.id)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <Edit2 className="h-3 w-3" />
                                    Edit
                                </button>
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleAdd}
                        className="flex min-h-[200px] flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-100 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/30"
                    >
                        <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
                            <Plus className="h-6 w-6 text-zinc-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Add New Address</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function InputGroup({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full border-b border-zinc-200 bg-transparent py-2 text-base font-bold tracking-tight text-black outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />
        </div>
    );
}
