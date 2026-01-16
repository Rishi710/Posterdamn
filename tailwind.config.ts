import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-body)', 'sans-serif'],
                heading: ['var(--font-heading)', 'sans-serif'],
                mono: ['var(--font-body)', 'sans-serif'], // Enforce Albert Sans for mono as well
                serif: ['var(--font-heading)', 'serif'], // Enforce Poppins for serif as fallback
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            animation: {
                'marquee': 'marquee 120s linear infinite',
                'marquee-slow': 'marquee 40s linear infinite',
                'marquee-reverse': 'marquee-reverse 120s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                'marquee-reverse': {
                    '0%': { transform: 'translateX(-50%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
