'use client'

import { XMarkIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

export default function Banner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative isolate flex items-center justify-center gap-x-6 overflow-hidden bg-black px-6 py-2.5 dark:bg-zinc-900 sm:px-3.5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white">
                    <span className="text-zinc-500">Notice:</span> FREE SHIPPING ON ALL ORDERS ABOVE ₹1499
                </p>
            </div>

            <div className="flex flex-1 justify-end">
                <button
                    type="button"
                    onClick={() => setIsVisible(false)}
                    className="-m-3 p-3 focus-visible:outline-offset-4"
                >
                    <span className="sr-only">Dismiss</span>
                    <XMarkIcon aria-hidden="true" className="size-4 text-white hover:text-zinc-400 transition-colors" />
                </button>
            </div>
        </div>
    )
}
