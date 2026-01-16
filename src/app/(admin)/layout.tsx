"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import {
    LayoutGrid,
    ShoppingBag,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Package,
    Menu,
    X,
    Ticket,
    Layers,
    Sun,
    Moon,
    Globe,
    ChevronDown
} from "lucide-react";

const SIDEBAR_ITEMS = [
    { name: "Overview", icon: LayoutGrid, href: "/admin/dashboard" },
    { name: "Inventory", icon: Package, href: "/admin/inventory" },
    { name: "Collections", icon: Layers, href: "/admin/collections" },
    { name: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { name: "Coupons", icon: Ticket, href: "/admin/coupons" },
    { name: "Customers", icon: Users, href: "/admin/customers" },
    { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // or /
    };

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-black">
            {/* Desktop Sidebar */}
            <aside
                onMouseEnter={() => setIsCollapsed(false)}
                onMouseLeave={() => setIsCollapsed(true)}
                className={`hidden flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:flex transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
                    }`}
            >
                <div className={`flex h-20 items-center border-b border-zinc-200 dark:border-zinc-800 ${isCollapsed ? "justify-center px-0" : "justify-between px-6"}`}>
                    <Link href="/admin/dashboard" className={`flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}>
                        <div className="h-6 w-6 flex-shrink-0 bg-black dark:bg-white rounded-sm" />
                        {!isCollapsed && (
                            <span className="text-sm tracking-tighter uppercase text-black dark:text-white whitespace-nowrap">
                                Posterdamn
                            </span>
                        )}
                    </Link>
                </div>
                <nav className="flex-1 space-y-2 p-4">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = pathname === item.href;

                        // Theme Toggle Logic to insert before Settings
                        if (item.name === "Settings") {
                            return (
                                <React.Fragment key="theme-settings-group">
                                    <button
                                        suppressHydrationWarning
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors group ${isCollapsed ? "justify-center" : ""}`}
                                        title={isCollapsed ? "Toggle Theme" : ""}
                                    >
                                        <div className="relative h-4 w-4 flex-shrink-0">
                                            <Sun className={`absolute inset-0 h-4 w-4 transition-all hidden dark:block ${isCollapsed ? "" : "opacity-50 group-hover:opacity-100"}`} />
                                            <Moon className={`absolute inset-0 h-4 w-4 transition-all block dark:hidden ${isCollapsed ? "" : "opacity-50 group-hover:opacity-100"}`} />
                                        </div>

                                        {!isCollapsed && (
                                            <>
                                                <span suppressHydrationWarning className="whitespace-nowrap overflow-hidden text-ellipsis hidden dark:block">Light Mode</span>
                                                <span suppressHydrationWarning className="whitespace-nowrap overflow-hidden text-ellipsis block dark:hidden">Dark Mode</span>
                                            </>
                                        )}
                                    </button>

                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-md px-3 py-3 text-xs uppercase tracking-widest transition-all group
                                            ${isActive
                                                ? "bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/5"
                                                : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                                            } ${isCollapsed ? "justify-center" : ""}`}
                                        title={isCollapsed ? item.name : ""}
                                    >
                                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "" : "opacity-50 group-hover:opacity-100"}`} />
                                        {!isCollapsed && (
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>
                                </React.Fragment>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-md px-3 py-3 text-xs uppercase tracking-widest transition-all group
                                    ${isActive
                                        ? "bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/5"
                                        : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                                    } ${isCollapsed ? "justify-center" : ""}`}
                                title={isCollapsed ? item.name : ""}
                            >
                                <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "" : "opacity-50 group-hover:opacity-100"}`} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-zinc-200 p-4 space-y-2 dark:border-zinc-800">
                    <button
                        className={`flex w-full items-center gap-3 px-3 py-2 text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-md ${isCollapsed ? "justify-center" : ""}`}
                        title="Sign Out"
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-20 items-center justify-between border-b border-zinc-200 px-8 dark:border-zinc-800">
                    <span className="text-sm tracking-tighter uppercase text-black dark:text-white">Posterdamn Admin</span>
                    <button onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <nav className="space-y-2 p-6">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 rounded-md px-4 py-3 text-xs uppercase tracking-widest transition-all
                                    ${isActive
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto border-t border-zinc-200 p-6 dark:border-zinc-800 space-y-4">
                    {/* Mobile Theme Toggle */}
                    {/* Mobile Theme Toggle */}
                    <button
                        suppressHydrationWarning
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-xs uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <div className="relative h-4 w-4 flex-shrink-0">
                            <Sun className="absolute inset-0 h-4 w-4 transition-all hidden dark:block" />
                            <Moon className="absolute inset-0 h-4 w-4 transition-all block dark:hidden" />
                        </div>
                        <span suppressHydrationWarning className="hidden dark:block">Light Mode</span>
                        <span suppressHydrationWarning className="block dark:hidden">Dark Mode</span>
                    </button>
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-md">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex h-16 lg:h-20 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:px-8 dark:border-zinc-800 dark:bg-black transition-all">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 -ml-1">
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="text-xs tracking-tighter uppercase truncate">Posterdamn Admin</span>
                    </div>

                    <div className="ml-auto flex items-center gap-6 relative">
                        {/* User Profile Dropdown Trigger */}
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="hidden sm:flex items-center gap-3 group focus:outline-none"
                        >
                            <div className="flex flex-col items-end mr-1 transition-opacity group-hover:opacity-80">
                                <span className="text-[10px] uppercase tracking-widest text-black dark:text-white">
                                    {mounted && user?.user_metadata?.full_name ? user.user_metadata.full_name : (user?.email?.split('@')[0] || "Admin")}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[8px] text-zinc-400 uppercase tracking-widest">Administrator</span>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative shadow-sm group-hover:shadow-md transition-all">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    <Users className="h-4 w-4 text-zinc-400" />
                                )}
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute top-14 right-0 w-56 z-20 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900 mb-1">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate">
                                            {user?.email}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Signed In</p>
                                    </div>
                                    <Link
                                        href="/account"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-sm transition-colors"
                                    >
                                        <Users className="h-3.5 w-3.5" />
                                        My Account
                                    </Link>
                                    <Link
                                        href="/"
                                        target="_blank"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-sm transition-colors"
                                    >
                                        <Globe className="h-3.5 w-3.5" />
                                        View Storefront
                                    </Link>

                                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-sm transition-colors"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Dashboard Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
