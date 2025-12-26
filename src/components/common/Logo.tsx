"use client";

import Link from "next/link";
import { Package } from "lucide-react";

interface LogoProps {
    className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
    const text = "POSTERDAMN";

    return (
        <Link
            href="/"
            className={`group relative inline-flex items-center gap-2 overflow-hidden py-1 ${className}`}
        >
            {/* Delivery Icon Animation */}
            <div className="relative flex items-center">
                <Package
                    className="h-5 w-5 text-black animate-in slide-in-from-left-8 fade-in duration-1000 ease-out dark:text-white sm:h-6 sm:w-6"
                    strokeWidth={2.5}
                />

                {/* Rolling Reveal Line */}
                <div className="absolute left-0 top-0 h-full w-[2px] bg-black dark:bg-white animate-[roll-reveal_1.2s_ease-in-out_forwards]"></div>
            </div>

            <div className="relative overflow-hidden">
                <span className="text-xl font-black uppercase tracking-tighter text-black dark:text-white sm:text-2xl">
                    {text}
                </span>

                {/* Reveal Overlay */}
                <div className="absolute inset-0 z-10 bg-white dark:bg-black animate-[reveal-text_1.2s_ease-in-out_forwards]"></div>
            </div>

            <style jsx>{`
                @keyframes reveal-text {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                @keyframes roll-reveal {
                    0% {
                        transform: translateX(-30px);
                        opacity: 0;
                    }
                    20% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(120px);
                        opacity: 0;
                    }
                }
            `}</style>
        </Link>
    );
}
