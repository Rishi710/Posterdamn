"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, ShoppingBag, Search, User, ChevronDown, X, Package, Heart, Tag, CreditCard, Bell, LogOut, Sun, Moon, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Logo from "@/components/common/Logo";
import { useStore } from "@/context/StoreContext";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { wishlist, cart, user, logout } = useStore();
    const router = useRouter();
    const pathname = usePathname();

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);

    // Cache for simple search to avoid too many requests? 
    // For now, let's debounce fetching.

    useEffect(() => setMounted(true), []);

    // Handle Search Logic
    useEffect(() => {
        const fetchSearch = async () => {
            if (searchQuery.trim().length > 1) {
                const query = searchQuery.toLowerCase();

                // Simple Search: Title or tag matches
                const { data, error } = await supabase
                    .from('products')
                    .select('id, title, images, product_variants(price)')
                    .ilike('title', `%${query}%`)
                    .limit(5);

                if (data) {
                    const mapped = data.map((p: any) => ({
                        ...p,
                        image: p.images?.[0] || "",
                        // Mock discount price for display
                        discountedPrice: p.product_variants?.[0]?.price || 0
                    }));
                    setSearchResults(mapped);
                } else {
                    setSearchResults([]);
                }

                // Suggestions (Mocking for now based on query, or simple expansion)
                // Real implementation would need a separate 'tags' table or similar.
                // We'll skip complex keyword suggestions for now to save API calls/latency
                setKeywordSuggestions([]);
            } else {
                setSearchResults([]);
                setKeywordSuggestions([]);
            }
        };

        // Debounce
        const timeoutId = setTimeout(fetchSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

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
                    <NavItem href="/shop?sort=collections" label="Collections" />
                    <NavItem href="/shop?tag=retro" label="Retro" />
                    <NavItem href="/shop?tag=stickers" label="Stickers" />
                    <NavItem href="/contact" label="Contact" />
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

                    <button
                        onClick={() => setIsSearchOpen(true)}
                        aria-label="Search"
                        className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <Search className="h-5 w-5" strokeWidth={1.5} />
                    </button>

                    {/* User Profile */}
                    {user ? (
                        <div className="relative group z-50">
                            <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-900 transition-colors hover:bg-black hover:text-white dark:border-gray-800 dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black">
                                <User className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-tight hidden sm:inline">
                                    {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || "Agent"}
                                </span>
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
                                    <button
                                        onClick={logout}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link href={`/login?next=${pathname}`} className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-900 transition-colors hover:bg-black hover:text-white dark:border-gray-800 dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black">
                            <User className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Login</span>
                        </Link>
                    )}

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
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>

                    {/* Menu Content */}
                    <div className="absolute right-0 top-0 h-screen w-[80%] max-w-sm bg-white p-8 shadow-2xl animate-in slide-in-from-right duration-500 ease-out dark:bg-black">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-12">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Navigation</h3>
                                <button onClick={() => setIsMenuOpen(false)} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex flex-col space-y-8">
                                <MobileLink href="/shop" onClick={() => setIsMenuOpen(false)}>Shop</MobileLink>
                                <MobileLink href="/shop?sort=collections" onClick={() => setIsMenuOpen(false)}>Collections</MobileLink>
                                <MobileLink href="/shop?tag=retro" onClick={() => setIsMenuOpen(false)}>Retro Arc</MobileLink>
                                <MobileLink href="/shop?tag=stickers" onClick={() => setIsMenuOpen(false)}>Stickers</MobileLink>
                                <MobileLink href="/shop?tag=custom" onClick={() => setIsMenuOpen(false)}>Customs</MobileLink>
                                <MobileLink href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</MobileLink>
                            </div>

                            <div className="mt-auto pt-12 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                                <User className="h-5 w-5 text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight text-black dark:text-white">
                                                    {user.user_metadata?.full_name || user.email?.split('@')[0] || "Agent"}
                                                </p>
                                                <p className="text-[10px] font-bold text-zinc-400">Premium Member</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Link href="/account/orders" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900 border border-transparent hover:border-black dark:hover:border-white transition-all">
                                                <Package className="h-5 w-5 mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Orders</span>
                                            </Link>
                                            <Link href="/account/wishlist" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900 border border-transparent hover:border-black dark:hover:border-white transition-all">
                                                <Heart className="h-5 w-5 mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Saved</span>
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Terminate Session
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center gap-3 w-full bg-black text-white dark:bg-white dark:text-black py-5 rounded-xl text-xs font-black uppercase tracking-[0.2em]"
                                    >
                                        <User className="h-5 w-5" />
                                        Authenticate
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Search Overlay (Apple Style) */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] outline-none">
                    {/* Backdrop with Blur */}
                    <div
                        className="absolute inset-0 bg-black/5 backdrop-blur-sm transition-opacity duration-500"
                        onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                        }}
                    ></div>

                    {/* Search Panel */}
                    <div className="absolute left-0 top-0 w-full animate-in slide-in-from-top-full duration-500 ease-out border-b border-gray-100 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-900/95">
                        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-zinc-800">
                                <Search className="h-6 w-6 text-zinc-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for posters, styles, collections..."
                                    className="flex-1 bg-transparent text-xl font-medium tracking-tight text-black outline-none placeholder:text-zinc-400 dark:text-white sm:text-2xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className="rounded-full p-2 text-zinc-400 hover:bg-gray-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </form>

                            <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2">
                                {/* Left Column: Quick Links / Popular */}
                                <div className="space-y-8">
                                    {!searchQuery ? (
                                        <>
                                            <div>
                                                <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Quick Links</h3>
                                                <ul className="space-y-3">
                                                    {['All Posters', 'New Arrivals', 'Supercars', 'Vintage Bikes', 'Custom Orders'].map((link) => (
                                                        <li key={link}>
                                                            <button
                                                                onClick={() => {
                                                                    setSearchQuery(link);
                                                                    router.push(`/shop?q=${encodeURIComponent(link)}`);
                                                                    setIsSearchOpen(false);
                                                                }}
                                                                className="text-sm font-bold text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                                                            >
                                                                {link}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                            <p className="text-sm font-medium text-zinc-400 underline underline-offset-8">
                                                Search results for &quot;{searchQuery}&quot;
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Live Results */}
                                <div>
                                    <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                        {searchQuery ? 'Top Results' : 'Featured Products'}
                                    </h3>
                                    <div className="space-y-4">
                                        {searchResults.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/shop/${product.id}`}
                                                onClick={() => {
                                                    setIsSearchOpen(false);
                                                    setSearchQuery("");
                                                }}
                                                className="group flex items-center gap-4 rounded-xl transition-all"
                                            >
                                                <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-zinc-800">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={product.image}
                                                        alt={product.title}
                                                        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-black dark:text-zinc-100 dark:group-hover:text-white">
                                                        {product.title}
                                                    </h4>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                        ₹{product.discountedPrice}
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-zinc-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 dark:text-zinc-600" />
                                            </Link>
                                        ))}
                                        {searchQuery && searchResults.length === 0 && (
                                            <div className="py-8 text-center sm:text-left">
                                                <p className="text-sm font-medium text-zinc-500">No posters found matching your search.</p>
                                            </div>
                                        )}
                                        {searchQuery && searchResults.length > 0 && (
                                            <button
                                                onClick={handleSearchSubmit}
                                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-900 transition-colors hover:bg-black hover:text-white dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-black"
                                            >
                                                View all results <ArrowRight className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
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
