"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SIZES = ["A6", "A5", "A4", "A3", "12 x 18"];
const MATERIALS = ["350 GSM", "Sunboard 5mm"];

export default function EditProduct() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Basic Info State
    const [title, setTitle] = useState("");
    const [collectionId, setCollectionId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Metadata Data
    const [collections, setCollections] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Variant Generation State
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);

    // Initial Fetch
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch Metadata
                const { data: cols } = await supabase.from('collections').select('*').order('name');
                const { data: cats } = await supabase.from('categories').select('*').order('name');
                if (cols) setCollections(cols);
                if (cats) setCategories(cats);

                // 2. Fetch Product Data
                const { data: product, error: productError } = await supabase
                    .from("products")
                    .select(`
                        id, title, description, collection_id, category_id, images, is_active,
                        product_variants (
                            id, size, material, price, stock, sku
                        )
                    `)
                    .eq("id", id)
                    .single();

                if (productError) throw productError;
                if (!product) throw new Error("Product not found");

                // 3. Populate State
                setTitle(product.title);
                setCollectionId(product.collection_id || "");
                setCategoryId(product.category_id || "");
                setDescription(product.description || "");
                setImageUrl(product.images?.[0] || "");
                setIsActive(product.is_active);

                // 4. Populate Variants
                const variants = product.product_variants || [];
                setGeneratedVariants(variants.map((v: any) => ({
                    ...v,
                    price: v.price.toString(), // Convert to string for input
                    stock: v.stock.toString()
                })));

                // Infer selected sizes/materials based on existing variants
                const sizes = Array.from(new Set(variants.map((v: any) => v.size))) as string[];
                const materials = Array.from(new Set(variants.map((v: any) => v.material))) as string[];
                setSelectedSizes(sizes);
                setSelectedMaterials(materials);

            } catch (err: any) {
                console.error("Error loading product:", err);
                alert("Error loading product: " + err.message);
                router.push("/admin/inventory");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, router]);

    const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter((i) => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const generateVariants = () => {
        const variants: any[] = [];
        const selectedCollection = collections.find(c => c.id === collectionId);
        const prefix = selectedCollection ? (selectedCollection.name.substring(0, 3).toUpperCase()) : "PRD";
        const titlePart = title ? title.substring(0, 3).toUpperCase() : "XXX";

        selectedSizes.forEach((size) => {
            selectedMaterials.forEach((material) => {
                const existing = generatedVariants.find(v => v.size === size && v.material === material);
                if (existing) {
                    variants.push(existing);
                } else {
                    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                    const sizePart = size.replace(/ /g, "").substring(0, 3).toUpperCase();
                    const matPart = material.substring(0, 3).toUpperCase();

                    variants.push({
                        size,
                        material,
                        price: "",
                        stock: 100,
                        sku: `${prefix}-${titlePart}-${sizePart}-${matPart}-${randomSuffix}`
                    });
                }
            });
        });
        setGeneratedVariants(variants);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...generatedVariants];
        newVariants[index][field] = value;
        setGeneratedVariants(newVariants);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...generatedVariants];
        newVariants.splice(index, 1);
        setGeneratedVariants(newVariants);
    };

    const handleSubmit = async () => {
        if (!title || !collectionId || !categoryId || !imageUrl) {
            alert("Please fill in all required fields.");
            return;
        }

        if (generatedVariants.length === 0) {
            alert("Please have at least one variant.");
            return;
        }

        // Validate variants
        for (const v of generatedVariants) {
            if (!v.price) {
                alert(`Please set a price for all variants (${v.size} - ${v.material}).`);
                return;
            }
        }

        setSaving(true);
        try {
            // 1. Update Product
            const { error: productError } = await supabase
                .from("products")
                .update({
                    title,
                    collection_id: collectionId,
                    category_id: categoryId,
                    description,
                    images: [imageUrl],
                    is_active: isActive
                })
                .eq("id", id);

            if (productError) throw productError;

            // 2. Handle Variants (Upsert matches on ID if present, else creates new if unique constraint satisfies)
            // But if specific ID is missing, we need to be careful.
            // Simplified approach: Delete all for this product excluding ones we want to keep? No, referencing orders might break (cascade set null?).
            // Better: Upsert by (product_id, size, material) if we have a unique constraint. We DO have UNIQUE(product_id, size, material).
            // So we can upsert based on that conflict.

            const selectedCollection = collections.find(c => c.id === collectionId);
            const prefix = selectedCollection ? selectedCollection.name.substring(0, 3).toUpperCase() : "PRD";

            const variantsToUpsert = generatedVariants.map(v => ({
                id: v.id, // Include ID if it exists
                product_id: id,
                size: v.size,
                material: v.material,
                price: parseFloat(v.price),
                stock: parseInt(v.stock),
                sku: v.sku
            }));

            // First, delete variants that are NO LONGER in the list
            // Get all current DB variant IDs
            const { data: currentDbVariants } = await supabase.from("product_variants").select("id").eq("product_id", id);
            if (currentDbVariants) {
                const keepingIds = variantsToUpsert.filter(v => v.id).map(v => v.id);
                const idsToDelete = currentDbVariants.filter(v => !keepingIds.includes(v.id)).map(v => v.id);

                if (idsToDelete.length > 0) {
                    await supabase.from("product_variants").delete().in("id", idsToDelete);
                }
            }

            // Then Upsert
            const { error: variantsError } = await supabase
                .from("product_variants")
                .upsert(variantsToUpsert, { onConflict: 'id' }); // Or rely on unique constraint? Using ID is safer for editing existing.

            if (variantsError) throw variantsError;

            alert("Product updated successfully!");
            router.push("/admin/inventory");

        } catch (error: any) {
            console.error("FULL ERROR OBJECT:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            alert(`Failed to update product: ${error.message || "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold uppercase tracking-widest text-zinc-400">Loading Editor...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/inventory" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">Edit Product</h1>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Update Details & Inventory</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black py-3 px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Details Card */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Core Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Product Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-sm font-bold outline-none focus:border-black dark:focus:border-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Collection</label>
                                    <select
                                        value={collectionId}
                                        onChange={(e) => setCollectionId(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-sm font-bold outline-none focus:border-black dark:focus:border-white transition-all appearance-none"
                                    >
                                        <option value="">SELECT COLLECTION</option>
                                        {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Category</label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-sm font-bold outline-none focus:border-black dark:focus:border-white transition-all appearance-none"
                                    >
                                        <option value="">SELECT CATEGORY</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-sm font-medium outline-none focus:border-black dark:focus:border-white transition-all resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isActive ? "translate-x-6" : ""}`} />
                                </button>
                                <span className="text-[10px] font-black uppercase tracking-widest">{isActive ? "Product is Active" : "Product is Hidden (Draft)"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant Generator Card */}
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Variant Matrix</h2>

                        <div className="space-y-6">
                            {/* Selection Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-3">Available Sizes</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZES.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => toggleSelection(size, selectedSizes, setSelectedSizes)}
                                                className={`px-3 py-2 text-[10px] font-bold border transition-all ${selectedSizes.includes(size)
                                                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                                    : "bg-white text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-3">Available Materials</label>
                                    <div className="flex flex-wrap gap-2">
                                        {MATERIALS.map(material => (
                                            <button
                                                key={material}
                                                onClick={() => toggleSelection(material, selectedMaterials, setSelectedMaterials)}
                                                className={`px-3 py-2 text-[10px] font-bold border transition-all ${selectedMaterials.includes(material)
                                                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                                    : "bg-white text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                                                    }`}
                                            >
                                                {material}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={generateVariants}
                                disabled={selectedSizes.length === 0 || selectedMaterials.length === 0}
                                className="w-full flex items-center justify-center gap-2 border border-black dark:border-white border-dashed py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                                Sync/Update Variants
                            </button>

                            {/* Generated Table */}
                            {generatedVariants.length > 0 && (
                                <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                                <th className="p-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Variant</th>
                                                <th className="p-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Price (₹)</th>
                                                <th className="p-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Stock</th>
                                                <th className="p-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">SKU</th>
                                                <th className="p-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {generatedVariants.map((variant, idx) => (
                                                <tr key={`${variant.size}-${variant.material}`} className="bg-white dark:bg-zinc-950">
                                                    <td className="p-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-black dark:text-white">{variant.size}</span>
                                                            <span className="text-[10px] text-zinc-500">{variant.material}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            type="number"
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                                                            className="w-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-xs font-bold outline-none focus:border-black transition-all"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            type="number"
                                                            value={variant.stock}
                                                            onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                                                            className="w-20 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-xs font-bold outline-none focus:border-black transition-all"
                                                        />
                                                    </td>
                                                    <td className="p-3 text-right flex items-center justify-end gap-2">
                                                        <input
                                                            type="text"
                                                            value={variant.sku}
                                                            onChange={(e) => updateVariant(idx, 'sku', e.target.value.toUpperCase())}
                                                            className="w-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-[10px] font-mono font-bold outline-none focus:border-black transition-all"
                                                            placeholder="SKU"
                                                        />
                                                        <button
                                                            onClick={() => removeVariant(idx)}
                                                            className="text-zinc-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Media */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 sticky top-8">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Media Assets</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Image Source URL</label>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-sm font-bold outline-none focus:border-black dark:focus:border-white transition-all"
                                />
                                <p className="text-[10px] text-zinc-400 mt-2">
                                    Direct link to image resource.
                                </p>
                            </div>

                            {/* Preview */}
                            <div className="aspect-[2/3] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                                {imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-400">
                                        <Upload className="h-8 w-8 mb-2 opacity-50" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">No Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
