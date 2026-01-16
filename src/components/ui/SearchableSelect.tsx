"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface Option {
    value: string;
    label: string;
    phoneCode?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    disabled?: boolean;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder,
    label,
    disabled = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                {label}
            </label>

            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex w-full items-center justify-between border-b border-zinc-200 bg-transparent py-2 text-base tracking-tight transition-colors outline-none
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer focus:border-black dark:focus:border-white"}
                    ${isOpen ? "border-black dark:border-white" : "dark:border-zinc-800"}
                    ${value ? "text-black dark:text-white" : "text-zinc-300 dark:text-zinc-700"}`}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full z-[60] mt-1 w-full overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                        <Search className="h-4 w-4 text-zinc-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-sm font-medium outline-none dark:text-white placeholder:text-zinc-400"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")}>
                                <X className="h-3 w-3 text-zinc-400" />
                            </button>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto overflow-x-hidden">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800
                                        ${opt.value === value ? "bg-zinc-50 dark:bg-zinc-800" : "font-medium text-zinc-600 dark:text-zinc-400"}`}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {opt.value === value && <Check className="h-4 w-4" />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-xs uppercase tracking-widest text-zinc-400">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
