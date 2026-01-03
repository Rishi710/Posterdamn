"use client";

import { usePathname } from "next/navigation";
import Banner from "./Banner";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/signup";

    if (isAuthPage) {
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
