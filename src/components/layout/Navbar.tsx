"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, ShoppingBag, Search, User, ChevronDown, X, Package, Heart, Tag, CreditCard, Bell, LogOut, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "@/components/common/Logo";
import { useStore } from "@/context/StoreContext";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { wishlist, cart } = useStore();

    useEffect(() => setMounted(true), []);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm dark:border-gray-800 dark:bg-black/80">
            <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand Logo - Left */}
                <div className="flex-shrink-0">
                    <Logo className="text-xl sm:text-2xl" />
                </div>

                {/* Center Navigation - Desktop */}
                <div className="hidden flex-1 items-center justify-center space-x-8 px-8 md:flex">
                    <NavItem href="/shop" label="Shop" hasDropdown />
                    <NavItem href="/collection" label="Collections" />
                    <NavItem href="/retro" label="Retro" />
                    <NavItem href="/stickers" label="Stickers" />
                    <NavItem href="/custom" label="Custom" />
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                        aria-label="Toggle Theme"
                    >
                        {mounted && theme === 'dark' ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
                    </button>

                    <button aria-label="Search" className="hidden rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white sm:block">
                        <Search className="h-5 w-5" strokeWidth={1.5} />
                    </button>

                    {/* User Profile Dropdown */}
                    <div className="relative group z-50">
                        <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-900 transition-colors hover:bg-black hover:text-white dark:border-gray-800 dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black">
                            <User className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-tight hidden sm:inline">Rishi</span>
                            <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                        </button>

                        <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                            <div className="rounded-xl border border-gray-100 bg-white p-1 shadow-2xl ring-1 ring-black ring-opacity-5 dark:border-zinc-800 dark:bg-zinc-900">
                                <DropdownItem href="/account" icon={User} label="My Profile" />
                                <DropdownItem href="/account/orders" icon={Package} label="Orders" />
                                <DropdownItem href="/account/wishlist" icon={Heart} label="Wishlist" badge={wishlist.length > 0 ? wishlist.length.toString() : undefined} />
                                <DropdownItem href="/account/coupons" icon={Tag} label="Coupons" />
                                <DropdownItem href="/account/gift-cards" icon={CreditCard} label="Gift Cards" />
                                <DropdownItem href="/account/notifications" icon={Bell} label="Notifications" />
                                <div className="my-1 border-t border-gray-100 dark:border-zinc-800"></div>
                                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/cart"
                        aria-label="Cart"
                        className="relative rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                        {mounted && cart.length > 0 && (
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="rounded-full p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800 md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="absolute top-20 left-0 w-full border-b border-gray-200 bg-white px-4 py-8 shadow-2xl dark:border-gray-800 dark:bg-black md:hidden animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col space-y-6">
                        <MobileLink href="/shop" onClick={() => setIsMenuOpen(false)}>Shop Posters</MobileLink>
                        <MobileLink href="/collections" onClick={() => setIsMenuOpen(false)}>Collections</MobileLink>
                        <MobileLink href="/custom" onClick={() => setIsMenuOpen(false)}>Custom Orders</MobileLink>
                        <MobileLink href="/help" onClick={() => setIsMenuOpen(false)}>Help Center</MobileLink>
                    </div>
                </div>
            )}
        </nav>
    );
}

function NavItem({ href, label, hasDropdown = false }: { href: string; label: string; hasDropdown?: boolean }) {
    return (
        <Link
            href={href}
            className="group flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
            {label}
            {hasDropdown && <ChevronDown className="ml-1 h-3 w-3 text-gray-400 transition-transform group-hover:rotate-180" />}
        </Link>
    );
}

function DropdownItem({ href, icon: Icon, label, badge }: { href: string; icon: any; label: string; badge?: string }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-black dark:text-gray-200 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
            <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-400" />
                {label}
            </div>
            {badge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-100 px-1 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {badge}
                </span>
            )}
        </Link>
    );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="text-2xl font-black tracking-tight text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
            {children}
        </Link>
    );
}
