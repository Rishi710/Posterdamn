"use client";

import ProductCard from "@/components/shop/ProductCard";
import { products, collections } from "@/data/mockData";
import { ChevronDown, Filter, Search as SearchIcon, X } from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 40;

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black p-8 text-center">Loading Shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQuery = searchParams.get("q") || "";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Filter State
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([]);
    const [priceRange, setPriceRange] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("recommended");
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const topRef = useRef<HTMLDivElement>(null);

    // Scroll to top when filter changes
    useEffect(() => {
        // Reset pagination when filters change
        setVisibleCount(ITEMS_PER_PAGE);

        if (selectedCollectionIds.length > 0 && topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedCollectionIds, priceRange, sortBy]);

    // Filtering & Sorting Logic
    const filteredProducts = products.filter((product) => {
        // 0. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesTitle = product.title.toLowerCase().includes(query);
            const matchesTags = product.tags?.some(tag => tag.toLowerCase().includes(query));
            const matchesCollection = collections.find(c => c.id === product.collectionId)?.name.toLowerCase().includes(query);

            if (!matchesTitle && !matchesTags && !matchesCollection) {
                return false;
            }
        }

        // 1. Collection Filter
        if (selectedCollectionIds.length > 0 && !selectedCollectionIds.includes(product.collectionId)) {
            return false;
        }

        // 2. Price Filter
        if (priceRange !== "all") {
            if (priceRange === "under-499" && product.discountedPrice >= 500) return false;
            if (priceRange === "500-999" && (product.discountedPrice < 500 || product.discountedPrice >= 1000)) return false;
            if (priceRange === "1000-1999" && (product.discountedPrice < 1000 || product.discountedPrice >= 2000)) return false;
            if (priceRange === "over-2000" && product.discountedPrice < 2000) return false;
        }

        return true;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "price-low") return a.discountedPrice - b.discountedPrice;
        if (sortBy === "price-high") return b.discountedPrice - a.discountedPrice;
        if (sortBy === "newest") return b.id.localeCompare(a.id); // Mock "newest" by ID
        return 0; // "recommended"
    });

    const displayProducts = sortedProducts.slice(0, visibleCount);
    const hasMore = visibleCount < sortedProducts.length;

    const toggleCollection = (id: number) => {
        setSelectedCollectionIds(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {/* Minimal Header */}
            <div className="border-b border-gray-200 bg-white sticky top-16 z-30 dark:border-zinc-800 dark:bg-black/80 dark:backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold uppercase tracking-wide text-black dark:text-white">
                            {searchQuery ? `Results for "${searchQuery}"` : "All Posters"}
                        </h1>
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                            {filteredProducts.length} Items
                        </span>
                        {searchQuery && (
                            <button
                                onClick={() => router.push("/shop")}
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white"
                            >
                                <X className="h-3 w-3" /> Clear Search
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Mobile Filter Toggle */}
                        <button
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 lg:hidden dark:text-gray-300"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Filter className="h-4 w-4" /> Filters
                        </button>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <div className="hidden items-center gap-2 text-sm text-gray-500 sm:flex dark:text-gray-400">
                                <span>Sort by:</span>
                                <button
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className="flex items-center gap-1 font-bold text-black dark:text-white"
                                >
                                    {sortBy === 'recommended' && 'Recommended'}
                                    {sortBy === 'newest' && 'Newest'}
                                    {sortBy === 'price-low' && 'Price: Low to High'}
                                    {sortBy === 'price-high' && 'Price: High to Low'}
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            {isSortOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={() => setIsSortOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                                        <SortOption label="Recommended" value="recommended" current={sortBy} onClick={setSortBy} setOpen={setIsSortOpen} />
                                        <SortOption label="Newest" value="newest" current={sortBy} onClick={setSortBy} setOpen={setIsSortOpen} />
                                        <SortOption label="Price: Low to High" value="price-low" current={sortBy} onClick={setSortBy} setOpen={setIsSortOpen} />
                                        <SortOption label="Price: High to Low" value="price-high" current={sortBy} onClick={setSortBy} setOpen={setIsSortOpen} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8" ref={topRef}>
                <div className="flex flex-col lg:flex-row lg:gap-12">
                    {/* Sticky Sidebar */}
                    <aside className={`fixed inset-y-0 left-0 z-40 w-80 transform bg-white p-6 transition-transform duration-300 ease-in-out lg:static lg:block lg:w-64 lg:transform-none lg:bg-transparent lg:p-0 dark:bg-black 
                        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>

                        <div className="flex items-center justify-between lg:hidden mb-8">
                            <span className="text-lg font-bold dark:text-white">Filters</span>
                            <button onClick={() => setIsSidebarOpen(false)}>
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        <div className="sticky top-40 space-y-10">
                            {/* Categories (Collections) */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                                    Collections
                                </h3>
                                {/* Scrollable area for many collections */}
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                                    {collections.map((collection) => (
                                        <label key={collection.id} className="flex items-center gap-3 group cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCollectionIds.includes(collection.id)}
                                                    onChange={() => toggleCollection(collection.id)}
                                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-black checked:bg-black dark:border-zinc-700 dark:checked:border-white dark:checked:bg-white"
                                                />
                                                <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white dark:text-black" viewBox="0 0 14 14" fill="none">
                                                    <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <span className={`text-sm transition-colors group-hover:text-black dark:group-hover:text-white ${selectedCollectionIds.includes(collection.id) ? 'font-bold text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {collection.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px w-full bg-gray-100 dark:bg-zinc-800" />

                            {/* Price */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                                    Price Range
                                </h3>
                                <div className="space-y-3">
                                    <PriceRadio label="All Prices" value="all" current={priceRange} onChange={setPriceRange} />
                                    <PriceRadio label="Under ₹499" value="under-499" current={priceRange} onChange={setPriceRange} />
                                    <PriceRadio label="₹500 - ₹999" value="500-999" current={priceRange} onChange={setPriceRange} />
                                    <PriceRadio label="₹1000 - ₹1999" value="1000-1999" current={priceRange} onChange={setPriceRange} />
                                    <PriceRadio label="Over ₹2000" value="over-2000" current={priceRange} onChange={setPriceRange} />
                                </div>
                            </div>

                            <div className="h-px w-full bg-gray-100 dark:bg-zinc-800" />

                            {/* Orientation */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                                    Orientation
                                </h3>
                                <div className="flex gap-2">
                                    <button className="flex-1 rounded border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:border-black hover:text-black dark:border-zinc-800 dark:text-gray-400 dark:hover:border-white dark:hover:text-white">
                                        Portrait
                                    </button>
                                    <button className="flex-1 rounded border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:border-black hover:text-black dark:border-zinc-800 dark:text-gray-400 dark:hover:border-white dark:hover:text-white">
                                        Landscape
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                            {displayProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-xl text-gray-500">No posters found matching your filters.</p>
                                <button
                                    onClick={() => { setSelectedCollectionIds([]); setPriceRange("all"); }}
                                    className="mt-4 text-sm font-bold underline"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination / Load More */}
                        {hasMore && (
                            <div className="mt-16 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="group relative overflow-hidden rounded-full bg-black px-8 py-3 dark:bg-white"
                                >
                                    <span className="relative z-10 text-sm font-bold text-white transition-colors group-hover:text-white dark:text-black dark:group-hover:text-black">
                                        Load More Posters
                                    </span>
                                    <div className="absolute inset-0 -translate-x-full bg-gray-800 transition-transform duration-300 group-hover:translate-x-0 dark:bg-gray-200" />
                                </button>
                            </div>
                        )}

                        {/* End of list message */}
                        {!hasMore && filteredProducts.length > 0 && (
                            <div className="mt-16 text-center text-sm text-gray-500">
                                You've viewed all {filteredProducts.length} posters.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile menu */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}

// Helper Component for Price Radio Buttons
function PriceRadio({ label, value, current, onChange }: { label: string, value: string, current: string, onChange: (val: string) => void }) {
    return (
        <label className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex items-center">
                <input
                    type="radio"
                    name="price"
                    checked={current === value}
                    onChange={() => onChange(value)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 transition-all checked:border-black checked:bg-black dark:border-zinc-700 dark:checked:border-white dark:checked:bg-white"
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white dark:bg-black opacity-0 peer-checked:opacity-100"></div>
            </div>
            <span className={`text-sm transition-colors group-hover:text-black dark:group-hover:text-white ${current === value ? 'font-medium text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {label}
            </span>
        </label>
    )
}

function SortOption({ label, value, current, onClick, setOpen }: { label: string, value: string, current: string, onClick: (val: string) => void, setOpen: (val: boolean) => void }) {
    return (
        <button
            onClick={() => {
                onClick(value);
                setOpen(false);
            }}
            className={`flex w-full items-center px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${current === value ? 'text-black dark:text-white bg-gray-50 dark:bg-zinc-800' : 'text-gray-500 dark:text-gray-400'}`}
        >
            {label}
        </button>
    );
}
