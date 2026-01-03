"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Instagram, Twitter, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        console.log("Form submitted:", formData);
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
        setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 bg-white dark:bg-black min-h-screen">
            {/* Header Section */}
            <div className="mb-20 space-y-4 text-center">
                <h1 className="text-5xl font-black italic tracking-tighter uppercase text-black dark:text-white lg:text-8xl">
                    Connect
                </h1>
                <p className="mx-auto max-w-2xl text-sm font-bold uppercase tracking-[0.3em] text-zinc-400">
                    Inquiries, Custom Orders, or just a Greeting. Our archive doors are always open.
                </p>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-16">
                {/* Left Column: Contact Info */}
                <div className="lg:col-span-5 space-y-16">
                    <div className="space-y-12">
                        <ContactInfoItem
                            icon={<Mail className="h-6 w-6" />}
                            label="Email Us"
                            value="support@posterdamn.com"
                            subValue="Response time: 24-48 hours"
                        />
                        <ContactInfoItem
                            icon={<Phone className="h-6 w-6" />}
                            label="Call Us"
                            value="+91 98765 43210"
                            subValue="Mon-Fri, 10am - 6pm IST"
                        />
                        <ContactInfoItem
                            icon={<MapPin className="h-6 w-6" />}
                            label="The Archive"
                            value="123 Creative Street, Industrial Area"
                            subValue="Indore, MP 452001, India"
                        />
                    </div>

                    {/* Socials */}
                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-12">
                        <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Follow the Archive</h3>
                        <div className="flex gap-6">
                            <a href="#" className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-100 transition-all hover:bg-black hover:text-white dark:border-zinc-800 dark:hover:bg-white dark:hover:text-black">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-100 transition-all hover:bg-black hover:text-white dark:border-zinc-800 dark:hover:bg-white dark:hover:text-black">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Column: Contact Form */}
                <div className="mt-16 lg:col-span-7 lg:mt-0">
                    <div className="relative overflow-hidden bg-zinc-50 p-8 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 lg:p-12">
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                                <CheckCircle2 className="h-16 w-16 text-black dark:text-white mb-6" strokeWidth={1} />
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">Message Delivered</h2>
                                <p className="mt-4 text-xs font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                    Your inquiry has been archived. Our curators will get back to you shortly.
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="mt-8 text-[10px] font-black uppercase tracking-widest underline underline-offset-4 hover:opacity-50"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-colors"
                                            placeholder="John Wick"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-colors"
                                            placeholder="wick@continental.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Subject</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Order Support">Order Support</option>
                                        <option value="Custom Poster">Custom Poster Request</option>
                                        <option value="Collaborations">Collaborations</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="group flex items-center gap-3 bg-black px-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                >
                                    Transmit Message
                                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactInfoItem({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) {
    return (
        <div className="flex gap-6">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-zinc-50 text-black dark:bg-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800">
                {icon}
            </div>
            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{label}</span>
                <p className="text-xl font-black uppercase tracking-tighter text-black dark:text-white leading-tight">{value}</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{subValue}</p>
            </div>
        </div>
    );
}
