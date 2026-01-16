"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Smartphone, ArrowRight, UserPlus, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: `${firstName} ${lastName}`.trim(),
                        phone_number: phone,
                    },
                },
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                router.push("/");
            }
        } catch (err: any) {
            console.error("SIGNUP_FETCH_ERROR:", err);
            setError(err.message === "Failed to fetch"
                ? "Connection Failed: Unable to reach the registration server. Please check your internet or Supabase status."
                : err.message || "An unexpected error occurred during registration.");
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) {
                setError(error.message);
                setLoading(false);
            }
        } catch (err: any) {
            console.error("SIGNUP_GOOGLE_FETCH_ERROR:", err);
            setError(err.message === "Failed to fetch"
                ? "Connection Failed: Could not initialize Google Sign-in. Please ensure you are online."
                : err.message || "OAuth initialization failed.");
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[100dvh] w-full bg-white dark:bg-black overflow-hidden">
            {/* Left Column: Visual Aesthetic */}
            <div className="hidden w-[60%] bg-zinc-950 lg:block relative group">
                <div className="absolute inset-0 bg-black/40 z-10 transition-colors group-hover:bg-black/20" />
                <img
                    src="https://image.pollinations.ai/prompt/abstract%20monochrome%20art%20curation%20geometric%20forms%20brutalist%20aesthetic?width=1200&height=1600&nologo=true"
                    alt="Signup Background"
                    className="h-full w-full object-cover grayscale opacity-60 transition-transform duration-[10s] group-hover:scale-110"
                />

                {/* Branding Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-20 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center bg-white text-black">
                        <UserPlus className="h-8 w-8" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-6xl tracking-tighter text-white uppercase leading-none">
                            Join the<br />Collective.
                        </h2>
                        <p className="max-w-md text-sm uppercase tracking-[0.2em] text-zinc-400">
                            Create Your Digital Passport to the Archive
                        </p>
                    </div>
                </div>

                {/* Floating Aesthetic Element */}
                <div className="absolute top-10 left-10 z-20">
                    <span className="text-[10px] uppercase tracking-[1em] text-zinc-500 transform -rotate-90 origin-left inline-block">
                        REGISTRATION MODULE v2.1
                    </span>
                </div>
            </div>

            {/* Right Column: Form Container */}
            <div className="flex w-full flex-col h-full lg:w-[40%]">
                {/* Fixed Top: Nav */}
                <div className="flex justify-between items-center p-8 md:p-12 lg:px-20 lg:py-10 text-zinc-500">
                    <Link href="/" className="group flex items-center text-[10px] uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Store
                    </Link>
                    <span className="text-[8px] tracking-widest uppercase">Encryption Active</span>
                </div>

                {/* Scrollable Center: Form */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-8 md:px-12 lg:px-20">
                    <div className="mx-auto w-full max-w-sm py-12">
                        <div className="mb-10">
                            <h1 className="text-5xl tracking-tighter text-black dark:text-white uppercase">Register</h1>
                            <p className="mt-4 text-xs uppercase tracking-widest text-zinc-400">
                                Already Enrolled? <Link href="/login" className="text-black dark:text-white underline underline-offset-4 hover:opacity-50">Enter Archive</Link>
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-[10px] uppercase tracking-widest text-red-600 dark:bg-red-950/20">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        {/* Auth Method Switch */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ... email form ... */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-400">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-sm outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-400">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-sm outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-400">Terminal Address (Email)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-sm outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors"
                                    placeholder="Email"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-400">Secret Key (Password)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-sm outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors"
                                    placeholder="Password"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-400">Mobile Link (Optional)</label>
                                <div className="flex items-center border-b-2 border-zinc-100 dark:border-zinc-800 focus-within:border-black dark:focus-within:border-white transition-colors">
                                    <span className="pr-4 text-xs text-zinc-400">IN +91</span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="flex-1 bg-transparent py-4 text-sm outline-none dark:text-white"
                                        placeholder=""
                                    />
                                </div>
                            </div>
                            <button
                                disabled={loading}
                                className="w-full bg-black py-5 text-xs uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                                {loading ? "Transmitting..." : "Initialize Identity"}
                            </button>
                            <p className="text-center text-[8px] uppercase tracking-widest text-zinc-400">
                                By proceeding, you accept our <a href="#" className="text-black dark:text-white underline underline-offset-2">Service Protocols</a>.
                            </p>
                        </form>

                        {/* Network Access */}
                        <div className="mt-12">
                            <div className="relative mb-8 flex items-center">
                                <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
                                <span className="mx-4 flex-shrink text-[9px] uppercase tracking-widest text-zinc-400">Fast Enrolment</span>
                                <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
                            </div>
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-4 border border-zinc-100 py-4 text-[10px] uppercase tracking-widest text-black transition-all hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-900"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Join with Google
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fixed Bottom: Utility Info */}
                <div className="p-8 md:p-12 lg:px-20 lg:py-8 border-t border-zinc-50 dark:border-zinc-900 bg-white dark:bg-black">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest">© 2026 POSTERDAMN ARCHIVE</span>
                        <div className="flex gap-4">
                            <a href="#" className="text-[8px] text-zinc-400 hover:text-black dark:hover:text-white uppercase tracking-widest">Privacy</a>
                            <a href="#" className="text-[8px] text-zinc-400 hover:text-black dark:hover:text-white uppercase tracking-widest">Terms</a>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
