"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: "Reset link sent! Please check your email terminal." });
            }
        } catch (err: any) {
            console.error("FORGOT_PWD_FETCH_ERROR:", err);
            setMessage({
                type: 'error',
                text: err.message === "Failed to fetch"
                    ? "Connection Failed: Unable to reach the recovery server. Please check your internet."
                    : err.message || "Failed to initiate protocol."
            });
        }
        setLoading(false);
    };

    return (
        <div className="flex h-[100dvh] w-full bg-white dark:bg-black overflow-hidden">
            {/* Left Column: Dark Aesthetic Visual */}
            <div className="hidden w-[60%] bg-zinc-950 lg:block relative group">
                <div className="absolute inset-0 bg-black/40 z-10 transition-colors group-hover:bg-black/20" />
                <img
                    src="https://image.pollinations.ai/prompt/minimalist%20monochrome%20grid%20security%20encryption%20concept?width=1200&height=1600&nologo=true"
                    alt="Forgot Password Background"
                    className="h-full w-full object-cover grayscale opacity-60 transition-transform duration-[10s] group-hover:scale-110"
                />

                {/* Branding Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-20 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center bg-white text-black">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-6xl tracking-tighter text-white uppercase leading-none">
                            Recovery<br />Protocol.
                        </h2>
                        <p className="max-w-md text-sm uppercase tracking-[0.2em] text-zinc-400">
                            Initiate Access Key Restoration Sequence
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Form Container */}
            <div className="flex w-full flex-col h-full lg:w-[40%]">
                {/* Fixed Top: Nav */}
                <div className="flex justify-between items-center p-8 md:p-12 lg:px-20 lg:py-10">
                    <Link href="/login" className="group flex items-center text-[10px] uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Login
                    </Link>
                    <div className="h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse" />
                </div>

                {/* Center: Form */}
                <div className="flex-1 flex items-center px-8 md:px-12 lg:px-20">
                    <div className="mx-auto w-full max-w-sm">
                        <div className="mb-12">
                            <h1 className="text-5xl tracking-tighter text-black dark:text-white uppercase leading-tight">Reset Key</h1>
                            <p className="mt-4 text-xs uppercase tracking-widest text-zinc-400">
                                Enter your Terminal ID to receive a recovery link.
                            </p>
                        </div>

                        {/* Message Display */}
                        {message && (
                            <div className={`mb-6 flex items-center gap-2 rounded-lg p-4 text-[10px] uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-950/20' : 'bg-red-50 text-red-600 dark:bg-red-950/20'}`}>
                                {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-400">Terminal ID (Email)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-sm outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors"
                                    placeholder=""
                                />
                            </div>

                            <button
                                disabled={loading || (message?.type === 'success')}
                                className="w-full bg-black py-5 text-xs uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                                {loading ? "Transmitting..." : "Send Recovery Link"}
                            </button>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-[8px] uppercase tracking-widest text-zinc-400">
                                Stuck? Contact <a href="mailto:support@posterdamn.xyz" className="text-black dark:text-white underline underline-offset-2">System Admin</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fixed Bottom: Utility Info */}
                <div className="p-8 md:p-12 lg:px-20 lg:py-8 border-t border-zinc-50 dark:border-zinc-900 bg-white dark:bg-black">
                    <span className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest">© 2026 POSTERDAMN RECOVERY MODULE</span>
                </div>
            </div>
        </div>
    );
}
