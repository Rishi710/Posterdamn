import ProductCard from "@/components/shop/ProductCard";
import { products } from "@/data/mockData";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop All Posters | Posterdamn",
    description: "Browse our premium collection of wall posters.",
};

export default function ShopPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-zinc-900/50">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Shop All Posters</h1>
                    <p className="mt-4 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                        Discover the best wall art for your home or office. From minimalist designs to vibrant pop culture references.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:gap-8">
                    {/* Sidebar / Filters (Placeholder for now) */}
                    <aside className="w-full lg:w-64 lg:flex-shrink-0"> // hidden on mobile initially if complex
                        <div className="sticky top-24 space-y-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-900">
                            {/* Category Filter */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Categories</h3>
                                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-center gap-2"><input type="checkbox" className="rounded border-gray-300" /> Anime</li>
                                    <li className="flex items-center gap-2"><input type="checkbox" className="rounded border-gray-300" /> Supercars</li>
                                    <li className="flex items-center gap-2"><input type="checkbox" className="rounded border-gray-300" /> Abstract</li>
                                    <li className="flex items-center gap-2"><input type="checkbox" className="rounded border-gray-300" /> Retro</li>
                                </ul>
                            </div>

                            <div className="h-px bg-gray-200 dark:bg-gray-700" />

                            {/* Price Filter */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Price</h3>
                                <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <label className="flex items-center gap-2"><input type="radio" name="price" /> Under ₹499</label>
                                    <label className="flex items-center gap-2"><input type="radio" name="price" /> ₹500 - ₹999</label>
                                    <label className="flex items-center gap-2"><input type="radio" name="price" /> Over ₹1000</label>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="mt-8 flex-1 lg:mt-0">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
