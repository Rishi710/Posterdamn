import CollectionsGrid from "@/components/home/CollectionsGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Collections | Posterdamn",
    description: "Explore our wide range of poster categories.",
};

export default function CollectionsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="bg-black py-24 text-center text-white">
                <span className="mb-4 inline-block text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Posterdamn Originals</span>
                <h1 className="text-5xl font-black uppercase tracking-tighter sm:text-8xl">Archives</h1>
                <p className="mt-6 text-lg font-medium text-zinc-400">Explore art for every passion.</p>
            </div>
            <CollectionsGrid />
        </div>
    );
}
