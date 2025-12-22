"use client";

import Link from "next/link";
import { Menu, ShoppingBag, Search, User, ChevronDown, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-black">
            <div className="mx-auto flex h-24 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand Logo - Left */}
                <div className="flex-shrink-0">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-black dark:text-white">
                        POSTER<span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-black dark:from-gray-300 dark:to-white">DAMN</span>
                    </Link>
                </div>

                {/* Center Navigation - Desktop (Two Rows) */}
                <div className="hidden flex-1 flex-col items-center justify-center space-y-2 px-8 md:flex">
                    {/* Top Row */}
                    <div className="flex items-center space-x-6">
                        <NavItem href="/shop" label="Shop" hasDropdown />
                        <NavItem href="/collection" label="Collections" />
                        <NavItem href="/retro" label="Retro" hasDropdown />
                        <NavItem href="/stickers" label="Stickers" hasDropdown />
                        <NavItem href="/custom" label="Custom" hasDropdown />
                    </div>
                    {/* Bottom Row */}
                    {/* <div className="flex items-center space-x-6">
                        <NavItem href="/custom" label="Custom Posters" />
                        <NavItem href="/stickers" label="Stickers" />
                        <NavItem href="/bulk" label="Bulk Posters" />
                        <NavItem href="/reviews" label="Reviews" />
                        <NavItem href="/help" label="Help Center" hasDropdown />
                    </div> */}
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-5">
                    <button aria-label="Search" className="text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white">
                        <Search className="h-6 w-6" strokeWidth={1.5} />
                    </button>

                    <button aria-label="Account" className="text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white">
                        <User className="h-6 w-6" strokeWidth={1.5} />
                    </button>

                    <button aria-label="Cart" className="relative text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white">
                        <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black">
                            0
                        </span>
                    </button>

                    {/* Mobile Menu Button - Visible only on small screens */}
                    <button
                        className="md:hidden text-gray-700 dark:text-gray-300"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="absolute top-24 left-0 w-full border-b border-gray-200 bg-white px-4 py-4 shadow-lg dark:border-gray-800 dark:bg-black md:hidden">
                    <div className="flex flex-col space-y-4">
                        <MobileLink href="/shop" onClick={() => setIsMenuOpen(false)}>Shop Poster</MobileLink>
                        <MobileLink href="/collections" onClick={() => setIsMenuOpen(false)}>Collections</MobileLink>
                        <MobileLink href="/custom" onClick={() => setIsMenuOpen(false)}>Custom Posters</MobileLink>
                        <MobileLink href="/retro" onClick={() => setIsMenuOpen(false)}>Retro Posters</MobileLink>
                        <MobileLink href="/stickers" onClick={() => setIsMenuOpen(false)}>Stickers</MobileLink>
                        <MobileLink href="/help" onClick={() => setIsMenuOpen(false)}>Help Center</MobileLink>
                    </div>
                </div>
            )}
        </nav>
    );
}

// Helper Components for cleaner code
function NavItem({ href, label, hasDropdown = false }: { href: string; label: string; hasDropdown?: boolean }) {
    return (
        <Link
            href={href}
            className="group flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
            {label}
            {hasDropdown && <ChevronDown className="ml-1 h-3 w-3 text-gray-400 transition-transform group-hover:rotate-180" />}
        </Link>
    );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block text-base font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
        >
            {children}
        </Link>
    );
}
