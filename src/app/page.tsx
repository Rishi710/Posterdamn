import Link from "next/link";
import { ArrowRight } from "lucide-react";
// import CollectionsGrid from "@/components/home/CollectionsGrid"; // Removed
import CollectionsScroll from "@/components/home/CollectionsScroll"; // Added

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex h-[80vh] w-full items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 z-0 opacity-50">
          {/* Placeholder for Hero Image - In a real app we would use <Image> */}
          <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2545&auto=format&fit=crop')] bg-cover bg-center" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl">
            Transform Your <span className="text-blue-500">Walls</span>.
          </h1>
          <p className="mb-8 text-xl text-gray-300 sm:text-2xl">
            Premium, museum-quality posters designed to inspire.
            Find the perfect art for your space.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-lg font-bold text-white transition-transform hover:scale-105 hover:bg-blue-700"
            >
              Shop Now
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center rounded-full border-2 border-white px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-white hover:text-black"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Scrollable Collections Preview */}
      <CollectionsScroll />

      {/* Featured Section */}
      <section className="bg-white py-16 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
              Trending Now
            </h2>
            <Link
              href="/shop"
              className="group flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
            >
              View all products
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Placeholder Products */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="group relative">
                <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-200">
                  <div className="h-full w-full bg-gray-300 transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Abstract Poster #{item}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Minimalist</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">$29.99</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
