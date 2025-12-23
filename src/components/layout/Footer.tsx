"use client";

import Link from "next/link";
import { ArrowUp, ArrowRight } from "lucide-react";

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="relative w-full overflow-hidden bg-black pt-0 pb-6 text-white">
            {/* 1. Top Contrast Marquee */}
            <div className="w-full bg-white py-3 border-b-[4px] border-black">
                <div className="flex animate-marquee whitespace-nowrap text-[11px] font-black uppercase tracking-[0.2em] text-black">
                    <MarqueeContent />
                    <MarqueeContent />
                    <MarqueeContent />
                </div>
            </div>

            <div className="relative mx-auto max-w-[1440px] px-6 pt-20 pb-12 lg:px-12">
                {/* 2. Giant Background Typography - Auto Scrolling */}
                <div className="pointer-events-none absolute -bottom-10 left-0 w-full select-none overflow-hidden whitespace-nowrap text-[22vw] font-black leading-none text-zinc-900/40 tracking-tighter">
                    <div className="flex animate-marquee-slow">
                        <span className="mr-24">POSTERDAMN</span>
                        <span className="mr-24">POSTERDAMN</span>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">

                    {/* Left Section: Branding & Newsletter */}
                    <div className="lg:col-span-6 flex flex-col items-start">
                        <h2 className="text-4xl font-black italic tracking-tighter sm:text-5xl lg:text-5xl">
                            DON&apos;T LET <br /> YOUR WALLS<br />
                            BE <span className="text-zinc-500">BORING.</span>
                        </h2>

                        <div className="mt-8 max-w-sm">
                            <p className="text-sm font-medium text-zinc-400">
                                Join the club. Get exclusive drops, design tips, and 10% off your first masterpiece.
                            </p>

                            <form className="mt-8 flex w-full max-w-sm items-center border-b border-zinc-700 pb-2 transition-colors focus-within:border-white">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-zinc-700"
                                />
                                <button type="submit" className="p-2 transition-transform hover:translate-x-1">
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </form>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <SocialPill label="Instagram" href="#" />
                                <SocialPill label="Twitter" href="#" />
                                <SocialPill label="Pinterest" href="#" />
                            </div>

                            {/* <div className="mt-12 flex flex-col gap-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-700">Support</span>
                                    <a href="mailto:hello@posterdamn.com" className="text-white hover:text-zinc-300 transition-colors lowercase tracking-normal text-sm font-medium">hello@posterdamn.com</a>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-700">Studio</span>
                                    <address className="not-italic text-white text-sm font-medium lowercase tracking-normal">
                                        LIG Street, Indore - 452001
                                    </address>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Right Section: Links Grid */}
                    <div className="lg:col-span-6 grid grid-cols-2 gap-8 sm:grid-cols-3">
                        <LinkColumn
                            title="Shop"
                            links={[
                                { label: "All Posters", href: "/shop" },
                                { label: "Collections", href: "/collection" },
                                { label: "Featured", href: "/featured" },
                                { label: "Limited Edition", href: "/limited" }
                            ]}
                        />
                        <LinkColumn
                            title="Company"
                            links={[
                                { label: "Our Story", href: "/about" },
                                { label: "Artists", href: "/artists" },
                                { label: "Collaborations", href: "/collabs" },
                                { label: "Careers", href: "/careers" }
                            ]}
                        />
                        <LinkColumn
                            title="Support"
                            links={[
                                { label: "FAQs", href: "/faq" },
                                { label: "Shipping & Returns", href: "/shipping" },
                                { label: "Contact Us", href: "/contact" },
                                { label: "Terms & Privacy", href: "/terms" }
                            ]}
                        />
                    </div>
                </div>

                {/* 3. Bottom Utility Bar */}
                <div className="relative z-10 mt-32 flex flex-col items-center justify-between gap-6 border-t border-zinc-900 pt-8 lg:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black">
                            N
                        </div>
                        <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                            © {new Date().getFullYear()} POSTERDAMN INC.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-700">Support</span>
                        <a href="mailto:hello@posterdamn.com" className="text-white hover:text-zinc-300 transition-colors lowercase tracking-normal text-sm font-medium">hello@posterdamn.com</a>
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
                    >
                        Back to Top
                        <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
                    </button>
                </div>
            </div>
        </footer>
    );
}

function MarqueeContent() {
    return (
        <span className="flex items-center">
            <span className="mx-6">Global Shipping</span>
            <span className="h-1.5 w-1.5 rounded-full bg-black/20" />
            <span className="mx-6">300 GSM Matte</span>
            <span className="h-1.5 w-1.5 rounded-full bg-black/20" />
            <span className="mx-6">Authentic Art</span>
            <span className="h-1.5 w-1.5 rounded-full bg-black/20" />
            <span className="mx-6">Secure Checkout</span>
            <span className="h-1.5 w-1.5 rounded-full bg-black/20" />
            <span className="mx-6">Premium Archival Paper</span>
            <span className="h-1.5 w-1.5 rounded-full bg-black/20" />
            <span className="mx-6">Made for Creators</span>
            <span className="h-1.5 w-1.5 rounded-full bg-black/20" />
        </span>
    );
}

function SocialPill({ label, href }: { label: string; href: string }) {
    return (
        <Link
            href={href}
            className="rounded-full border border-zinc-800 px-6 py-2 text-xs font-bold tracking-wider transition-all hover:bg-white hover:text-black"
        >
            {label}
        </Link>
    );
}

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div className="flex flex-col gap-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                {title}
            </h4>
            <ul className="flex flex-col gap-4">
                {links.map((link, i) => (
                    <li key={i}>
                        <Link
                            href={link.href}
                            className="text-base font-medium tracking-tight text-white transition-opacity hover:opacity-50"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
