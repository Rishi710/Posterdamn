"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl tracking-tighter uppercase text-black dark:text-white">
                        Access Denied
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        You do not have the required permissions to access this area. This zone is restricted to administrators only.
                    </p>
                </div>

                <div className="pt-8 flex flex-col gap-4">
                    <Link
                        href="/"
                        className="w-full bg-black dark:bg-white text-white dark:text-black uppercase tracking-widest py-4 px-8 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Return Home
                    </Link>

                    <Link
                        href="/account"
                        className="text-xs uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        Go to My Account
                    </Link>
                </div>
            </div>
        </div>
    );
}
