import Link from 'next/link';

export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black p-8 text-center">
            <h1 className="text-4xl tracking-tighter uppercase mb-4 text-black dark:text-white">
                Authentication Error
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
                We encountered an issue while verifying your identity. This could be due to an expired link or a configuration problem.
            </p>
            <Link
                href="/login"
                className="bg-black py-4 px-10 text-xs uppercase tracking-widest text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
                Return to Login
            </Link>
            <Link
                href="/"
                className="mt-4 text-xs uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white underline underline-offset-4"
            >
                Go to Homepage
            </Link>
        </div>
    );
}
