"use client";

import Link from "next/link";

interface LogoProps {
    className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
    const text = "POSTERDAMN";

    return (
        <Link
            href="/"
            className={`group inline-flex items-center gap-0.5 text-2xl font-black tracking-tighter ${className}`}
        >
            {text.split("").map((char, i) => (
                <span
                    key={i}
                    className={`
                        inline-block transition-all duration-300 ease-out
                        group-hover:-translate-y-1 group-hover:scale-110
                        ${i > 5 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400' : 'text-black dark:text-white'}
                    `}
                    style={{ transitionDelay: `${i * 30}ms` }}
                >
                    {char}
                </span>
            ))}
        </Link>
    );
}
