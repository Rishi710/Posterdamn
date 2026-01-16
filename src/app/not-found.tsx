import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-4 text-center">
            <h1 className="text-9xl tracking-tighter text-black dark:text-white mb-4 animate-pulse">404</h1>
            <h2 className="text-xl uppercase tracking-widest text-zinc-400 mb-8">Archive Not Found</h2>
            <p className="max-w-md text-sm text-zinc-500 uppercase tracking-widest leading-relaxed mb-12">
                The item you're looking for doesn't exist or has been removed from our active inventory.
            </p>
            <Link
                href="/"
                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-[0.2em] transition-all hover:opacity-80 active:scale-95 shadow-2xl"
            >
                Return to Home
            </Link>
        </div>
    );
}
