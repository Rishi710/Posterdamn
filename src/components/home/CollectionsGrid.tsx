"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { collections } from "@/data/mockData";

export default function CollectionsGrid() {
    return (
        <section className="bg-gray-50 py-12 dark:bg-white">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-black sm:text-6xl">
                        The Infinite <span className="text-blue-600">Wall</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        Dive into 40+ unique worlds. Find your vibe.
                    </p>
                </div>

                <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 space-y-4">
                    {collections.map((item, index) => {
                        // Generate a random-ish tilt for the "messy wall" look
                        const tilt = index % 2 === 0 ? "rotate-1" : "-rotate-1";
                        const margin = index % 3 === 0 ? "mt-4" : "mt-0";

                        // Dynamic Image URL (Pollinations AI)
                        const safeName = item.name.replace(/ /g, "%20");
                        const imageUrl = `https://image.pollinations.ai/prompt/${safeName}%20poster%20art%20high%20quality?width=400&height=600&nologo=true&seed=${item.id}`;

                        return (
                            <Link
                                key={item.id}
                                href={`/shop/${item.name.toLowerCase().replace(/ /g, "-")}`}
                                className={`group relative mb-4 flex break-inside-avoid flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:z-10 hover:-translate-y-2 hover:rotate-0 hover:shadow-2xl dark:bg-gray-900 ${tilt} ${margin}`}
                            >
                                {/* Image Block */}
                                <div className="aspect-[3/4] w-full bg-gray-200 relative overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imageUrl}
                                        alt={`${item.name} Poster Collection`}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                                </div>

                                {/* Collection Name Overlay */}
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-white shadow-black drop-shadow-md sm:text-base">
                                            {item.name}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-white opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}
