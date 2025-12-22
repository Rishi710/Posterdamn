export default function Footer() {
    return (
        <footer className="w-full border-t border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Posterdamn. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
