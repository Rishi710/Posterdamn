"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navigation = [
        { name: "My Profile", href: "/account", icon: User },
        { name: "Orders", href: "/account/orders", icon: Package },
        { name: "Addresses", href: "/account/addresses", icon: MapPin },
        { name: "Wishlist", href: "/account/wishlist", icon: Heart },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 text-black dark:text-white">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    {/* Mobile Navigation (Horizontal Scroll) */}
                    <div className="lg:hidden mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl tracking-tighter text-black dark:text-white uppercase">My Account</h2>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Manage your space</p>
                            </div>
                            <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${isActive
                                            ? "bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/5"
                                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                            }`}
                                    >
                                        <item.icon className="h-3.5 w-3.5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Sidebar (Desktop Only) */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24">
                            <div className="mb-8">
                                <h2 className="text-2xl tracking-tighter text-black dark:text-white uppercase">My Account</h2>
                                <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 mt-1">Manage your space</p>
                            </div>

                            <nav className="flex flex-col gap-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`group flex items-center justify-between px-4 py-3 text-sm uppercase tracking-widest transition-all ${isActive
                                                ? "bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/5"
                                                : "text-zinc-500 hover:bg-zinc-100/50 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-900/50 dark:hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <item.icon
                                                    className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive ? "" : "text-zinc-500 group-hover:text-black dark:group-hover:text-white"}`}
                                                    strokeWidth={1.5}
                                                />
                                                {item.name}
                                            </div>
                                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                <button className="group flex w-full items-center px-4 py-3 text-sm uppercase tracking-widest text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
                                    <LogOut
                                        className="mr-3 h-4 w-4"
                                        strokeWidth={1.5}
                                    />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="mt-12 lg:col-span-9 lg:mt-0">
                        <div className="min-h-[600px]">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
