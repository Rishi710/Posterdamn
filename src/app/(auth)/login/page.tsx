"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, Smartphone, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-black">
            {/* Left Column: Visual (Hidden on mobile) */}
            <div className="hidden w-1/2 bg-black lg:block relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://image.pollinations.ai/prompt/cyberpunk%20japan%20night%20city%20poster%20art?width=1000&height=1500&nologo=true"
                    alt="Login Banner"
                    className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute bottom-10 left-10 z-20 text-white">
                    <h2 className="text-4xl font-bold tracking-tight">Welcome Back to the Art.</h2>
                    <p className="mt-4 text-lg text-gray-300 max-w-md">
                        Sign in to access your curated wishlist, track orders, and experience the collection.
                    </p>
                </div>
            </div>

            {/* Right Column: Key Form */}
            <div className="flex w-full flex-col justify-center px-4 lg:w-1/2 sm:px-12 xl:px-24">
                <div className="mx-auto w-full max-w-md">
                    <Link href="/" className="mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        New here? <Link href="/signup" className="font-bold text-black underline hover:text-blue-600 dark:text-white">Create an account</Link>
                    </p>

                    {/* Social Login */}
                    <div className="mt-8 space-y-4">
                        <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500 dark:bg-black">Or continue with</span>
                        </div>
                    </div>

                    {/* Auth Method Toggle */}
                    <div className="mb-6 flex rounded-lg bg-gray-100 p-1 dark:bg-zinc-900">
                        <button
                            onClick={() => setAuthMethod("email")}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${authMethod === "email" ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
                        >
                            <Mail className="h-4 w-4" /> Email
                        </button>
                        <button
                            onClick={() => setAuthMethod("phone")}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${authMethod === "phone" ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
                        >
                            <Smartphone className="h-4 w-4" /> Phone (OTP)
                        </button>
                    </div>

                    {/* Forms */}
                    {authMethod === "email" ? (
                        <form className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <input
                                    type="password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                                    Forgot password?
                                </Link>
                            </div>
                            <button className="flex w-full items-center justify-center rounded-lg bg-black py-4 font-bold text-white transition-transform active:scale-95 dark:bg-white dark:text-black">
                                Sign In
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                <div className="flex gap-2">
                                    <div className="flex items-center justify-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-zinc-700 dark:bg-zinc-800">
                                        🇮🇳 +91
                                    </div>
                                    <input
                                        type="tel"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                                        placeholder="98765 43210"
                                    />
                                </div>
                            </div>
                            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-4 font-bold text-white transition-transform active:scale-95 dark:bg-white dark:text-black">
                                Send OTP <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
