"use client";

import React from "react";
import { Plus, Search, Filter, MoreVertical, Package, ExternalLink } from "lucide-react";

export default function AdminInventory() {
    return (
        <div className="space-y-12">
            <section>
                <div className="mb-10 flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-10">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Inventory</h1>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">Archive Control / Product Management</p>
                    </div>
                    <button className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black py-4 px-8 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95">
                        <Plus className="h-4 w-4" />
                        Release New Product
                    </button>
                </div>

                {/* Filters/Toolbar */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH ARCHIVE..."
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-all"
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-zinc-100 dark:border-zinc-800 py-4 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            <Filter className="h-3 w-3" />
                            Filter
                        </button>
                        <select className="flex-1 md:flex-none bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 py-4 px-6 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                            <option>ALL CATEGORIES</option>
                            <option>ABSTRACT</option>
                            <option>MINIMAL</option>
                            <option>BRUTALIST</option>
                        </select>
                    </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-zinc-100 dark:border-zinc-900">
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Product</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">SKU</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Price</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">In Stock</th>
                                <th className="text-right py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <tr key={i} className="group hover:bg-white dark:hover:bg-zinc-950 transition-colors cursor-default">
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
                                                <img src={`https://loremflickr.com/100/100/art,minimal?random=${i}`} alt="Product" className="h-full w-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black italic tracking-tighter uppercase leading-none mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">Urban Geometry #{i}</p>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Minimalist Collection</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="text-[10px] font-mono text-zinc-400">PD-24-{100 + i}</span>
                                    </td>
                                    <td className="py-6 px-4 text-[10px] font-black uppercase tracking-widest">Architecture</td>
                                    <td className="py-6 px-4 text-[10px] font-black uppercase tracking-widest">₹1,299</td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{45 - (i * 3)}</span>
                                            <div className="h-1 w-12 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-black dark:bg-white" style={{ width: `${80 - (i * 10)}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:text-black dark:hover:text-white text-zinc-400 transition-colors">
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 hover:text-black dark:hover:text-white text-zinc-400 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
