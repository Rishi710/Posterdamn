"use client";

import { usePathname } from "next/navigation";
import Banner from "./Banner";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const isAdminPage = pathname?.startsWith("/admin");

    if (isAuthPage || isAdminPage) {
        return (
            <main className="flex min-h-screen flex-col">
                {children}
            </main>
        );
    }

    return (
        <>
            <Banner />
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </>
    );
}
