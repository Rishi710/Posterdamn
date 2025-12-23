"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

import { StoreProvider } from "@/context/StoreContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <StoreProvider>
                {children}
            </StoreProvider>
        </ThemeProvider>
    );
}
