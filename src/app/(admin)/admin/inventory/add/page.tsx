"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SIZES = ["A6", "A5", "A4", "A3", "12 x 18"];
const MATERIALS = ["350 GSM", "Sunboard 5mm"];

export default function AddProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Basic Info State
    const [title, setTitle] = useState("");
    const [collectionId, setCollectionId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // Metadata Data
    const [collections, setCollections] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [refreshMetadata, setRefreshMetadata] = useState(0);

    // Initial Fetch
    React.useEffect(() => {
        const fetchMeta = async () => {
            const { data: cols } = await supabase.from('collections').select('*').order('name');
            const { data: cats } = await supabase.from('categories').select('*').order('name');
            if (cols) setCollections(cols);
            if (cats) setCategories(cats);
        };
        fetchMeta();
    }, [refreshMetadata]);

    // Quick Create Helper
    const quickCreate = async (type: 'collections' | 'categories', name: string) => {
        if (!name) return;
        const slug = name.toLowerCase().replace(/ /g, "-");
        const { error } = await supabase.from(type).insert({ name, slug });
        if (error) {
            alert("Error creating: " + error.message);
        } else {
            setRefreshMetadata(prev => prev + 1);
            alert(`${type === 'collections' ? 'Collection' : 'Category'} created!`);
        }
    };

    // Variant Generation State
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);

    const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter((i) => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const generateVariants = () => {
        const variants: any[] = [];
        selectedSizes.forEach((size) => {
            selectedMaterials.forEach((material) => {
                // Check if already exists to preserve pricing if re-generating
                const existing = generatedVariants.find(v => v.size === size && v.material === material);
                if (existing) {
                    variants.push(existing);
                } else {
                    variants.push({
                        size,
                        material,
                        price: "",
                        stock: 100,
                        sku: ""
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
            alert("Please fill in all required fields (Title, Collection, Category, Image URL).");
            return;
        }

        if (generatedVariants.length === 0) {
            alert("Please generate at least one product variant.");
            return;
        }

        // Validate variants
        for (const v of generatedVariants) {
            if (!v.price) {
                alert(`Please set a price for all variants (${v.size} - ${v.material}).`);
                return;
            }
        }

        setLoading(true);

        try {
            // 1. Create Product
            const { data: productData, error: productError } = await supabase
                .from("products")
                .insert({
                    title,
                    collection_id: collectionId,
                    category_id: categoryId,
                    description,
                    images: [imageUrl],
                    is_active: true
                })
                .select()
                .single();

            if (productError) throw productError;

            const productId = productData.id;

            // 2. Create Variants
            const selectedCollection = collections.find(c => c.id === collectionId);
            const prefix = selectedCollection ? selectedCollection.name.substring(0, 3).toUpperCase() : "PRD";

            const variantsToInsert = generatedVariants.map(v => ({
                product_id: productId,
                size: v.size,
                material: v.material,
                price: parseFloat(v.price),
                stock: parseInt(v.stock),
                sku: v.sku || `${prefix}-${title.substring(0, 3).toUpperCase()}-${v.size}-${v.material.substring(0, 3)}`
            }));

            const { error: variantsError } = await supabase
                .from("product_variants")
                .insert(variantsToInsert);

            if (variantsError) throw variantsError;

            alert("Product released successfully!");
            router.push("/admin/inventory");

        } catch (error: any) {
            console.error("FULL ERROR OBJECT:", error);
            if (error.message) console.error("Error Message:", error.message);
            if (error.details) console.error("Error Details:", error.details);
            if (error.hint) console.error("Error Hint:", error.hint);

            alert(`Failed to create product: ${error.message || JSON.stringify(error) || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/inventory" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">New Product</h1>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Add to Global Inventory</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black py-3 px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="h-4 w-4" />
                    {loading ? "Releasing..." : "Release Product"}
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
                                    placeholder=""
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest">Collection</label>
                                        <button
                                            onClick={() => {
                                                const name = prompt("Enter new Collection name:");
                                                if (name) quickCreate('collections', name);
                                            }}
                                            className="text-[9px] font-bold text-blue-500 hover:underline uppercase"
                                        >
                                            + Valid New
                                        </button>
                                    </div>
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
                                    <div className="flex justify-between mb-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest">Category</label>
                                        <button
                                            onClick={() => {
                                                const name = prompt("Enter new Category name:");
                                                if (name) quickCreate('categories', name);
                                            }}
                                            className="text-[9px] font-bold text-blue-500 hover:underline uppercase"
                                        >
                                            + Valid New
                                        </button>
                                    </div>
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
                                    placeholder="Product story and details..."
                                />
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
                                Generate Pricing Matrix
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
                                                            placeholder="0.00"
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
                                                    <td className="p-3 text-right">
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
                                    placeholder="https://..."
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
