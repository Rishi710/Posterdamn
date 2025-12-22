import CollectionsGrid from "@/components/home/CollectionsGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Collections | Posterdamn",
    description: "Explore our wide range of poster categories.",
};

export default function CollectionsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="bg-black py-16 text-center text-white">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">All Collections</h1>
                <p className="mt-4 text-gray-400">Discover art for every passion.</p>
            </div>
            <CollectionsGrid />
        </div>
    );
}
