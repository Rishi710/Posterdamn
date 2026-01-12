"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, ExternalLink, RefreshCw, Folder, Tag, X, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
    id: string;
    title: string;
    collection: { name: string } | null;
    category: { name: string } | null;
    price: number;
    images: string[];
    is_active: boolean;
    variants_count?: number;
    stock_total?: number;
}

interface MetadataItem {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export default function AdminInventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Metadata State
    const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
    const [activeMetadataTab, setActiveMetadataTab] = useState<'collections' | 'categories'>('collections');
    const [metadataItems, setMetadataItems] = useState<MetadataItem[]>([]);
    const [newItemName, setNewItemName] = useState("");
    const [newItemSlug, setNewItemSlug] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Fetch products with relations
            const { data, error } = await supabase
                .from("products")
                .select(`
                    id, title, is_active, images,
                    collections (name),
                    categories (name),
                    product_variants (
                        price, stock
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;

            console.log("Raw Fetch Data:", data);

            // Transform data
            const transformed = data.map((p: any) => {
                const variants = p.product_variants || [];
                const totalStock = variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
                const minPrice = variants.length > 0 ? Math.min(...variants.map((v: any) => v.price)) : 0;

                return {
                    id: p.id,
                    title: p.title,
                    collection: p.collections, // Now an object { name: ... }
                    category: p.categories,   // Now an object { name: ... }
                    images: p.images || [],
                    is_active: p.is_active,
                    price: minPrice,
                    variants_count: variants.length,
                    stock_total: totalStock
                };
            });

            setProducts(transformed);
        } catch (err: any) {
            console.error("Error fetching inventory:", err);
            // alert("Error fetching inventory: " + JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("products")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            alert("Error updating status: " + err.message);
        }
    };

    const handleDeleteProduct = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

        try {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            alert("Error deleting product: " + err.message);
        }
    };

    const fetchMetadata = async () => {
        const table = activeMetadataTab;
        const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
        if (data) setMetadataItems(data);
    };

    useEffect(() => {
        fetchProducts();
    }, [refreshTrigger]);

    useEffect(() => {
        if (isMetadataModalOpen) {
            fetchMetadata();
        }
    }, [isMetadataModalOpen, activeMetadataTab]);

    const handleCreateMetadata = async () => {
        if (!newItemName) return;
        const slug = newItemSlug || newItemName.toLowerCase().replace(/ /g, "-");

        try {
            const { error } = await supabase.from(activeMetadataTab).insert({
                name: newItemName,
                slug: slug
            });

            if (error) throw error;

            setNewItemName("");
            setNewItemSlug("");
            fetchMetadata();
        } catch (err: any) {
            alert("Error creating item: " + err.message);
        }
    };

    const handleDeleteMetadata = async (id: string) => {
        if (!confirm("Are you sure? This might affect products using this tag.")) return;
        await supabase.from(activeMetadataTab).delete().eq("id", id);
        fetchMetadata();
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.collection?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-20 relative">
            <section>
                <div className="mb-10 flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-10">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Inventory</h1>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">{products.length} Products Online</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsMetadataModalOpen(true)}
                            className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-black dark:text-white py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        >
                            <Folder className="h-4 w-4" />
                            Manage Tags
                        </button>
                        <Link href="/admin/inventory/add" className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black py-4 px-8 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95">
                            <Plus className="h-4 w-4" />
                            Release New Product
                        </Link>
                    </div>
                </div>

                {/* Filters/Toolbar */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH ARCHIVE..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-all"
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button onClick={() => setRefreshTrigger(prev => prev + 1)} className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-zinc-100 dark:border-zinc-800 py-4 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-zinc-100 dark:border-zinc-900">
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Product</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Inventory</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Collection</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Start Price</th>
                                <th className="text-right py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                        Loading Archive...
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                        No products found in archive.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-white dark:hover:bg-zinc-950 transition-colors cursor-default">
                                        <td className="py-6 px-4">
                                            <button
                                                onClick={() => handleToggleActive(product.id, product.is_active)}
                                                className="flex items-center gap-2 group/status hover:opacity-80 transition-opacity"
                                            >
                                                <div className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] ${product.is_active ? "bg-green-500 shadow-green-500/40" : "bg-red-500 shadow-red-500/40"}`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{product.is_active ? "Active" : "Draft"}</span>
                                            </button>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
                                                    {product.images[0] && (
                                                        <img src={product.images[0]} alt="Product" className="h-full w-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black italic tracking-tighter uppercase leading-none mb-1 group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-1">{product.title}</p>
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{product.variants_count} Variants</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest">{product.stock_total}</span>
                                                <span className="text-[9px] font-bold text-zinc-400">units</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">{product.collection?.name || "-"}</td>
                                        <td className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">{product.category?.name || "-"}</td>
                                        <td className="py-6 px-4 text-[10px] font-black uppercase tracking-widest">₹{product.price}</td>
                                        <td className="py-6 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:text-black dark:hover:text-white text-zinc-400 transition-colors">
                                                    <ExternalLink className="h-4 w-4" />
                                                </button>
                                                <div className="relative group/menu">
                                                    <button className="p-2 hover:text-black dark:hover:text-white text-zinc-400 transition-colors">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    <div className="hidden group-hover/menu:block absolute right-0 top-full w-40 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl z-10 py-1">
                                                        <Link
                                                            href={`/admin/inventory/edit/${product.id}`}
                                                            className="block w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                                        >
                                                            Edit Data
                                                        </Link>
                                                        <button
                                                            onClick={() => handleToggleActive(product.id, product.is_active)}
                                                            className="block w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-900"
                                                        >
                                                            {product.is_active ? "Set as Draft" : "Set as Active"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id, product.title)}
                                                            className="block w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 border-t border-zinc-100 dark:border-zinc-900"
                                                        >
                                                            Delete Product
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Metadata Modal */}
            {isMetadataModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-xl font-black uppercase tracking-tighter">Manage Tags</h2>
                            <button onClick={() => setIsMetadataModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Tabs */}
                            <div className="flex gap-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
                                <button
                                    onClick={() => setActiveMetadataTab('collections')}
                                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeMetadataTab === 'collections' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                    Collections
                                </button>
                                <button
                                    onClick={() => setActiveMetadataTab('categories')}
                                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeMetadataTab === 'categories' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                    Categories
                                </button>
                            </div>

                            {/* Create New */}
                            <div className="flex gap-4 mb-8">
                                <input
                                    type="text"
                                    placeholder={`NEW ${activeMetadataTab.slice(0, -1).toUpperCase()} NAME...`}
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-xs font-bold outline-none focus:border-black dark:focus:border-white transition-all uppercase"
                                />
                                <button
                                    onClick={handleCreateMetadata}
                                    disabled={!newItemName}
                                    className="bg-black dark:bg-white text-white dark:text-black px-6 text-[10px] font-black uppercase tracking-widest hover:opacity-80 disabled:opacity-50"
                                >
                                    Create
                                </button>
                            </div>

                            {/* List */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {metadataItems.length === 0 ? (
                                    <p className="text-center text-xs text-zinc-400 py-8">No {activeMetadataTab} found.</p>
                                ) : (
                                    metadataItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 group">
                                            <div className="flex items-center gap-3">
                                                {activeMetadataTab === 'collections' ? <Folder className="h-4 w-4 text-zinc-400" /> : <Tag className="h-4 w-4 text-zinc-400" />}
                                                <span className="text-xs font-bold">{item.name}</span>
                                                <span className="text-[10px] font-mono text-zinc-400">{item.slug}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteMetadata(item.id)}
                                                className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
