import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Zap, Palette } from "lucide-react";
import CollectionsScroll from "@/components/home/CollectionsScroll";
import FAQ from "@/components/home/FAQ";
import ProductCard from "@/components/shop/ProductCard";
import { products } from "@/data/mockData";

export default function Home() {
  // Get trending products (first 4 items from the mock data)
  const trendingProducts = products.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative flex h-[90vh] w-full items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 z-0 opacity-60">
          <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-10000 hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-6 text-center">
          <span className="mb-4 inline-block text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
            Premium Poster Boutique
          </span>
          <h1 className="mb-6 text-6xl font-black uppercase tracking-tighter sm:text-8xl lg:text-9xl">
            OWN THE <br /> <span className="text-zinc-500">AESTHETIC.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-zinc-300 sm:text-xl">
            Museum-quality prints for the modern curator. <br className="hidden sm:block" />
            Curated collections that turn your space into a gallery.
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="/shop"
              className="group relative overflow-hidden bg-white px-10 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-zinc-200"
            >
              <span className="relative z-10 flex items-center gap-2">
                Shop Collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/collections"
              className="px-10 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:text-zinc-400"
            >
              Explore Archive
            </Link>
          </div>
        </div>
      </section>

      {/* Why Posterdamn? Features Section */}
      <section className="border-y border-zinc-100 py-24 dark:border-zinc-900">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="FAST & SECURE"
              desc="Global shipping with reinforced protective tubes."
            />
            <FeatureCard
              icon={<Palette className="h-6 w-6" />}
              title="ARCHIVAL QUALITY"
              desc="300 GSM deep matte paper for a premium finish."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="ARTIST FIRST"
              desc="Exclusive designs you won't find anywhere else."
            />
            <FeatureCard
              icon={<Truck className="h-6 w-6" />}
              title="FREE DELIVERY"
              desc="On all orders above ₹1499 across India."
            />
          </div>
        </div>
      </section>

      {/* Scrollable Collections Preview */}
      <CollectionsScroll />

      {/* Featured Section */}
      <section className="py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Curated Choice</span>
              <h2 className="mt-2 text-4xl font-black uppercase tracking-tighter text-black dark:text-white sm:text-5xl">
                Trending Now
              </h2>
            </div>
            <Link
              href="/shop"
              className="group flex items-center text-xs font-black uppercase tracking-widest text-black dark:text-white"
            >
              View all products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-start">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-black dark:bg-zinc-900 dark:text-white transition-transform hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-black dark:text-white">
        {title}
      </h3>
      <p className="text-sm font-medium leading-relaxed text-zinc-500">
        {desc}
      </p>
    </div>
  );
}
