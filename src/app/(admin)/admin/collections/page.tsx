"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Layers,
    Plus,
    Search,
    MoreVertical,
    Trash2,
    Edit2,
    Folder,
    ChevronRight,
    ChevronDown,
    Image as ImageIcon,
    X,
    Save,
    ExternalLink
} from "lucide-react";
import Link from "next/link";

interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id: string | null;
    created_at: string;
}

export default function AdminCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image_url: "",
        parent_id: "" as string | null
    });

    // Expansion State for Hierarchy
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setCollections(data || []);
        } catch (err) {
            console.error("Error fetching collections:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return;

        try {
            const payload = {
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/ /g, "-"),
                description: formData.description,
                image_url: formData.image_url,
                parent_id: formData.parent_id || null
            };

            if (editingCollection) {
                const { error } = await supabase
                    .from('collections')
                    .update(payload)
                    .eq('id', editingCollection.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('collections')
                    .insert(payload);
                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditingCollection(null);
            setFormData({ name: "", slug: "", description: "", image_url: "", parent_id: null });
            fetchCollections();
        } catch (err: any) {
            alert("Error saving collection: " + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will remove the collection reference from all posters and sub-collections.")) return;

        try {
            const { error } = await supabase
                .from('collections')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchCollections();
        } catch (err: any) {
            alert("Error deleting collection: " + err.message);
        }
    };

    const openEdit = (col: Collection) => {
        setEditingCollection(col);
        setFormData({
            name: col.name,
            slug: col.slug,
            description: col.description || "",
            image_url: col.image_url || "",
            parent_id: col.parent_id
        });
        setIsModalOpen(true);
    };

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    // Helper to build tree structure
    const buildTree = (cols: Collection[], parentId: string | null = null): any[] => {
        return cols
            .filter(c => c.parent_id === parentId)
            .map(c => ({
                ...c,
                children: buildTree(cols, c.id)
            }));
    };

    const collectionTree = buildTree(collections);

    // Sidebar rendering of nested items
    const renderNode = (node: any, level: number = 0) => {
        const isExpanded = expandedIds.has(node.id);
        const hasChildren = node.children.length > 0;

        return (
            <React.Fragment key={node.id}>
                <div
                    className={`flex items-center gap-4 py-4 px-6 group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900 ${level > 0 ? "bg-zinc-50/30 dark:bg-zinc-900/10" : "bg-white dark:bg-zinc-950"}`}
                    style={{ paddingLeft: `${24 + level * 32}px` }}
                >
                    <div className="flex items-center gap-3 flex-1">
                        {hasChildren ? (
                            <button onClick={() => toggleExpand(node.id)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                        ) : (
                            <div className="w-6" />
                        )}
                        <div className="h-10 w-10 flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
                            {node.image_url ? (
                                <img src={node.image_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <Folder className="h-4 w-4 text-zinc-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-[10px] uppercase tracking-widest text-black dark:text-white leading-tight">{node.name}</h3>
                            <p className="text-[8px] text-zinc-400 uppercase tracking-widest mt-1">/{node.slug}</p>
                        </div>
                    </div>

                    <div className="hidden md:block flex-1 max-w-xs overflow-hidden">
                        <p className="text-[10px] text-zinc-500 font-medium truncate">{node.description || "No description provided."}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(node)} className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(node.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {isExpanded && node.children.map((child: any) => renderNode(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8 gap-4">
                <div>
                    <h1 className="text-4xl tracking-tighter lg:text-5xl uppercase text-black dark:text-white">Collections</h1>
                    <p className="text-sm text-zinc-500 uppercase tracking-widest mt-2">Hierarchical Taxonomy Management</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setEditingCollection(null);
                            setFormData({ name: "", slug: "", description: "", image_url: "", parent_id: null });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black py-4 px-8 text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" />
                        New Collection
                    </button>
                </div>
            </div>

            {/* Tree List */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-black/5">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Hierarchy View</span>
                    <button onClick={fetchCollections} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        Refresh Structure
                    </button>
                </div>

                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {loading ? (
                        <div className="py-20 text-center animate-pulse">
                            <Layers className="h-8 w-8 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400">Syncing Taxonomy...</span>
                        </div>
                    ) : collections.length === 0 ? (
                        <div className="py-20 text-center">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400">No collections found. Start by creating one.</span>
                        </div>
                    ) : (
                        collectionTree.map(node => renderNode(node))
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full">
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-8">
                            <Layers className="h-6 w-6 text-black dark:text-white" />
                            <h2 className="text-2xl tracking-tighter uppercase text-black dark:text-white">
                                {editingCollection ? "Edit Collection" : "New Collection"}
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Display Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 uppercase tracking-widest outline-none border border-transparent focus:border-black dark:focus:border-white transition-all"
                                            placeholder="E.G. MOVIES"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">SEO URL SLUG</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 uppercase tracking-widest outline-none border border-transparent focus:border-black dark:focus:border-white transition-all text-[10px]"
                                            placeholder="LEAVE EMPTY FOR AUTO"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Parent Collection</label>
                                        <select
                                            value={formData.parent_id || ""}
                                            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 text-xs uppercase tracking-widest outline-none appearance-none"
                                        >
                                            <option value="">TOP-LEVEL (NO PARENT)</option>
                                            {collections
                                                .filter(c => c.id !== editingCollection?.id) // Prevent self-parenting
                                                .map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name.toUpperCase()}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Thumbnail URL</label>
                                        <div className="flex gap-4">
                                            <div className="h-14 w-14 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center flex-shrink-0">
                                                {formData.image_url ? (
                                                    <img src={formData.image_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="h-5 w-5 text-zinc-400" />
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 text-[10px] outline-none border border-transparent focus:border-black dark:focus:border-white transition-all"
                                                placeholder="PASTE IMAGE URL..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Description</label>
                                        <textarea
                                            rows={5}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 font-medium text-xs outline-none focus:ring-1 ring-black dark:ring-white transition-all resize-none"
                                            placeholder="BRIEF OVERVIEW OF THIS COLLECTION..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full bg-black dark:bg-white text-white dark:text-black py-5 text-xs uppercase tracking-[0.2em] hover:opacity-80 transition-opacity mt-4 flex items-center justify-center gap-3"
                            >
                                <Save className="h-4 w-4" />
                                {editingCollection ? "Commit Changes" : "Create Collection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
