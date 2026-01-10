"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
interface Collection {
    id: string;
    name: string;
    slug: string;
}

export default function CollectionsScroll({ collections }: { collections: Collection[] }) {
    // Split collections into 3 rows for visual variety
    // Ensure we have enough items for rows. If not, just duplicate whatever we have.
    const items = collections.length > 0 ? collections : [];

    // Distribute randomly or sequentially
    const row1 = items.filter((_, i) => i % 3 === 0);
    const row2 = items.filter((_, i) => i % 3 === 1);
    const row3 = items.filter((_, i) => i % 3 === 2);

    return (
        <section className="border-b border-gray-100 bg-white py-16 dark:border-gray-800 dark:bg-black overflow-hidden">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Explore Collections
                        </h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Find your perfect vibe from our diverse catalog.
                        </p>
                    </div>
                    <Link
                        href="/shop"
                        className="group flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
                    >
                        View all categories
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>

            {/* Marquee Rows Container */}
            <div className="space-y-8">
                {row1.length > 0 && <MarqueeRow items={row1} direction="right" />}
                {row2.length > 0 && <MarqueeRow items={row2} direction="left" />}
                {row3.length > 0 && <MarqueeRow items={row3} direction="right" />}
            </div>
        </section >
    );
}

// Helper component for a single marquee row
function MarqueeRow({ items, direction }: { items: Collection[], direction: 'left' | 'right' }) {
    // We duplicate the items to create the seamless loop
    const displayItems = [...items, ...items, ...items, ...items]; // Quadruple to be safe on wide screens

    return (
        <div className="relative flex overflow-hidden group">
            {/* The moving track */}
            <div
                className={`flex w-max space-x-4 ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'} hover:[animation-play-state:paused]`}
            >
                {displayItems.map((item, index) => {
                    // Using index in key because we have duplicates of the same ID
                    const uniqueKey = `${item.id}-${index}`;
                    const safeName = item.name.replace(/ /g, "%20");
                    const imageUrl = `https://image.pollinations.ai/prompt/${safeName}%20poster%20art%20high%20quality?width=300&height=400&nologo=true&seed=${item.id}`;

                    return (
                        <Link
                            key={uniqueKey}
                            href={`/shop/${item.name.toLowerCase().replace(/ /g, "-")}`}
                            className="relative h-[200px] w-[150px] flex-shrink-0 overflow-hidden rounded-lg transition-transform hover:scale-105 sm:h-[240px] sm:w-[180px]"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/10 transition-colors hover:bg-black/0" />
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
                                <span className="text-sm font-bold text-white shadow-sm">
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
