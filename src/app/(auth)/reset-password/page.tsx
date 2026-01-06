"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check for errors in the URL fragment (Supabase sends errors after the #)
        const hash = window.location.hash;
        if (hash.includes("error=")) {
            const params = new URLSearchParams(hash.substring(1));
            const errorDesc = params.get("error_description") || params.get("error") || "Authentication failed.";
            setMessage({ type: 'error', text: errorDesc.replace(/\+/g, ' ') });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match." });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: "Access key restored! Redirecting to your profile..." });
                setTimeout(() => {
                    router.push("/account?reset=success");
                }, 2000);
            }
        } catch (err: any) {
            console.error("RESET_PWD_FETCH_ERROR:", err);
            setMessage({
                type: 'error',
                text: err.message === "Failed to fetch"
                    ? "Connection Failed: Could not finalize the restore. Please check your internet."
                    : err.message || "Protocol update failed."
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
                    src="https://image.pollinations.ai/prompt/monochrome%20brutalist%20architecture%20sharp%20angles%20encryption%20concept?width=1200&height=1600&nologo=true"
                    alt="Reset Password Background"
                    className="h-full w-full object-cover grayscale opacity-60 transition-transform duration-[10s] group-hover:scale-110"
                />

                {/* Branding Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-20 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center bg-white text-black">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                            Identity<br />Update.
                        </h2>
                        <p className="max-max-w-md text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
                            Finalize Restoration Protocol
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Form Container */}
            <div className="flex w-full flex-col h-full lg:w-[40%]">
                {/* Fixed Top: Nav */}
                <div className="flex justify-between items-center p-8 md:p-12 lg:px-20 lg:py-10">
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Secure Authentication Module
                    </div>
                    <div className="h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse" />
                </div>

                {/* Center: Form */}
                <div className="flex-1 flex items-center px-8 md:px-12 lg:px-20">
                    <div className="mx-auto w-full max-w-sm">
                        <div className="mb-12">
                            <h1 className="text-5xl font-black italic tracking-tighter text-black dark:text-white uppercase leading-tight">New Key</h1>
                            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                                Set your new access credentials to regain entry.
                            </p>
                        </div>

                        {/* Message Display */}
                        {message && (
                            <div className={`mb-6 flex items-center gap-2 rounded-lg p-4 text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-950/20' : 'bg-red-50 text-red-600 dark:bg-red-950/20'}`}>
                                {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New Secret Key</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-sm font-bold outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors pr-10"
                                        placeholder=""
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Confirm Secret Key</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-sm font-bold outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors pr-10"
                                        placeholder=""
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                disabled={loading || !password || password !== confirmPassword || password.length < 6}
                                className="w-full bg-black py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Fixed Bottom: Utility Info */}
                <div className="p-8 md:p-12 lg:px-20 lg:py-8 border-t border-zinc-50 dark:border-zinc-900 bg-white dark:bg-black">
                    <span className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest">© 2026 POSTERDAMN SECURITY MODULE</span>
                </div>
            </div>
        </div>
    );
}
