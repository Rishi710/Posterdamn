"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "What is the paper quality?",
        answer: "We use premium 300 GSM matte archival paper. It's thick, durable, and has a non-reflective finish that makes the colors pop under any lighting condition."
    },
    {
        question: "How do you ship the posters?",
        answer: "Your art deserves the best protection. We ship all posters in reinforced, heavy-duty cardboard tubes to ensure they arrive in pristine condition, free from creases or folds."
    },
    {
        question: "Can I get a custom size?",
        answer: "Absolutely! While we offer standard A3, A4, and A5 sizes, we can print custom dimensions for your specific frame. Just drop us a message via the Custom Order page."
    },
    {
        question: "What is your return policy?",
        answer: "We want you to love your art. If your poster arrives damaged or isn't what you expected, we offer a hassle-free 7-day return or replacement policy. No questions asked."
    },
    {
        question: "Do frames come included?",
        answer: "Currently, we sell print-only posters to keep shipping costs low and give you the freedom to choose a frame that matches your decor perfectly. We do plan to add framing options soon!"
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="bg-white py-24 dark:bg-black">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* Left Column: Aesthetic Poster Image (30-40%) */}
                    <div className="relative order-last lg:order-first lg:col-span-4">
                        <div className="sticky top-24">
                            <div className="aspect-[3/4] w-full rotate-[-2deg] overflow-hidden rounded-2xl bg-gray-100 shadow-2xl transition-transform duration-500 hover:rotate-0 dark:bg-zinc-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://image.pollinations.ai/prompt/minimalist%20typography%20art%20poster%20faq%20aesthetic?width=600&height=800&nologo=true"
                                    alt="FAQ Poster"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -bottom-6 -right-6 -z-10 h-32 w-32 rounded-full blur-3xl opacity-30 bg-blue-500" />
                        </div>
                    </div>

                    {/* Right Column: Content (60-70%) */}
                    <div className="lg:col-span-8">
                        <div className="mb-12">
                            <h2 className="text-3xl tracking-tight text-black dark:text-white sm:text-5xl">
                                You Ask, <span className="text-gray-400">We Answer</span>
                            </h2>
                            <p className="mt-4 text-lg text-gray-500">
                                Everything you need to know about our posters and service.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition-all duration-200 hover:border-black/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
                                >
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="flex w-full items-center justify-between px-6 py-5 text-left"
                                    >
                                        <span className="text-lg text-black dark:text-white">
                                            {faq.question}
                                        </span>
                                        <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                            {openIndex === index ? (
                                                <Minus className="h-5 w-5 text-black dark:text-white" />
                                            ) : (
                                                <Plus className="h-5 w-5 text-gray-400" />
                                            )}
                                        </span>
                                    </button>

                                    <div
                                        className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="px-6 pb-6 leading-relaxed text-gray-600 dark:text-gray-400">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
