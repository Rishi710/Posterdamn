"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const { login } = useStore();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login
        login("Rishi");
        router.push("/");
    };

    return (
        <div className="flex h-[100dvh] w-full bg-white dark:bg-black overflow-hidden">
            {/* Left Column: Dark Aesthetic Visual */}
            <div className="hidden w-[60%] bg-zinc-950 lg:block relative group">
                <div className="absolute inset-0 bg-black/40 z-10 transition-colors group-hover:bg-black/20" />
                <img
                    src="https://image.pollinations.ai/prompt/minimalist%20art%20gallery%20monochrome%20lithograph%20texture%20premium?width=1200&height=1600&nologo=true"
                    alt="Login Background"
                    className="h-full w-full object-cover grayscale opacity-60 transition-transform duration-[10s] group-hover:scale-110"
                />

                {/* Branding Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-20 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center bg-white text-black">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                            The<br />Archive<br />Awaits.
                        </h2>
                        <p className="max-w-md text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
                            Authentication Required for Curated Access
                        </p>
                    </div>
                </div>

                {/* Floating Aesthetic Element */}
                <div className="absolute top-10 left-10 z-20">
                    <span className="text-[10px] font-black uppercase tracking-[1em] text-zinc-500 transform -rotate-90 origin-left inline-block">
                        POSTERDAMN AUTH v1.0
                    </span>
                </div>
            </div>

            {/* Right Column: Form Container */}
            <div className="flex w-full flex-col h-full lg:w-[40%]">
                {/* Fixed Top: Nav */}
                <div className="flex justify-between items-center p-8 md:p-12 lg:px-20 lg:py-10">
                    <Link href="/" className="group flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Store
                    </Link>
                    <div className="h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse" />
                </div>

                {/* Scrollable Center: Form */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-8 md:px-12 lg:px-20">
                    <div className="mx-auto w-full max-w-sm py-12">
                        <div className="mb-12">
                            <h1 className="text-5xl font-black italic tracking-tighter text-black dark:text-white uppercase">Sign In</h1>
                            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                                New Courier? <Link href="/signup" className="text-black dark:text-white underline underline-offset-4 hover:opacity-50">Create Identity</Link>
                            </p>
                        </div>

                        {/* Auth Method Switch */}
                        <div className="mb-8 flex border border-zinc-100 dark:border-zinc-800 p-1">
                            <button
                                onClick={() => setAuthMethod("email")}
                                className={`flex flex-1 items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${authMethod === "email" ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400 hover:text-black dark:hover:text-white"}`}
                            >
                                Email
                            </button>
                            <button
                                onClick={() => setAuthMethod("phone")}
                                className={`flex flex-1 items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${authMethod === "phone" ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400 hover:text-black dark:hover:text-white"}`}
                            >
                                OTP
                            </button>
                        </div>

                        {authMethod === "email" ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Terminal ID (Email)</label>
                                    <input
                                        type="email"
                                        className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-sm font-bold outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors"
                                        placeholder="courier@posterdamn.xyz"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Access Key (Password)</label>
                                    <input
                                        type="password"
                                        className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-sm font-bold outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white underline underline-offset-4">
                                        Lost Password?
                                    </button>
                                </div>
                                <button className="w-full bg-black py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                                    Authenticate
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Secure Line (Phone)</label>
                                    <div className="flex items-center border-b-2 border-zinc-100 dark:border-zinc-800 focus-within:border-black dark:focus-within:border-white transition-colors">
                                        <span className="pr-4 text-xs font-bold text-zinc-400">IN +91</span>
                                        <input
                                            type="tel"
                                            className="flex-1 bg-transparent py-4 text-sm font-bold outline-none dark:text-white"
                                            placeholder="98765 43210"
                                        />
                                    </div>
                                </div>
                                <button className="flex w-full items-center justify-center gap-3 bg-black py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                                    Transmit OTP <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>
                        )}

                        {/* Socials */}
                        <div className="mt-12">
                            <div className="relative mb-8 flex items-center">
                                <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
                                <span className="mx-4 flex-shrink text-[9px] font-black uppercase tracking-widest text-zinc-400">Network Bypass</span>
                                <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="flex w-full items-center justify-center gap-4 border border-zinc-100 py-4 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-900"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign in with Google
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fixed Bottom: Utility Info */}
                <div className="p-8 md:p-12 lg:px-20 lg:py-8 border-t border-zinc-50 dark:border-zinc-900 bg-white dark:bg-black">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest">© 2026 POSTERDAMN ARCHIVE</span>
                        <div className="flex gap-4">
                            <a href="#" className="text-[8px] font-bold text-zinc-400 hover:text-black dark:hover:text-white uppercase tracking-widest">Privacy</a>
                            <a href="#" className="text-[8px] font-bold text-zinc-400 hover:text-black dark:hover:text-white uppercase tracking-widest">Protocol</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
