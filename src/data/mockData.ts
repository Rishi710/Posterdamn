export const collections = [
    { id: 1, name: "Supercars" },
    { id: 2, name: "Vintage Bikes" },
    { id: 3, name: "Wildlife" },
    { id: 4, name: "Rock Bands" },
    { id: 5, name: "Anime Classics" },
    { id: 6, name: "Cyberpunk" },
    { id: 7, name: "Abstract Art" },
    { id: 8, name: "Minimalist" },
    { id: 9, name: "Football" },
    { id: 10, name: "Basketball" },
    { id: 11, name: "Formula 1" },
    { id: 12, name: "Hip Hop" },
    { id: 13, name: "Jazz & Blues" },
    { id: 14, name: "Sci-Fi Movies" },
    { id: 15, name: "Horror" },
    { id: 16, name: "Retro Gaming" },
    { id: 17, name: "Landscapes" },
    { id: 18, name: "Cityscapes" },
    { id: 19, name: "Architecture" },
    { id: 20, name: "Typography" },
    { id: 21, name: "Pop Art" },
    { id: 22, name: "Space & NASA" },
    { id: 23, name: "Botanical" },
    { id: 24, name: "Maps" },
    { id: 25, name: "Fashion" },
    { id: 26, name: "Quotes" },
    { id: 27, name: "Gym & Fitness" },
    { id: 28, name: "Yoga" },
    { id: 29, name: "Travel" },
    { id: 30, name: "Food & Drink" },
    { id: 31, name: "Cats" },
    { id: 32, name: "Dogs" },
    { id: 33, name: "Surrealism" },
    { id: 34, name: "Street Art" },
    { id: 35, name: "Comics" },
    { id: 36, name: "Cars (JDM)" },
    { id: 37, name: "Bicycles" },
    { id: 38, name: "Ocean" },
    { id: 39, name: "Mountains" },
    { id: 40, name: "Sunsets" },
];

export interface Product {
    id: string;
    collectionId: number;
    title: string;
    description: string;
    price: number; // MRP
    discountedPrice: number; // Selling Price
    image: string;
    sizes: string[];
    materials: string[];
    tags: string[];
}

// Helper to generate products dynamically so we don't have to write 400 items manually
const generateProducts = (): Product[] => {
    const allProducts: Product[] = [];
    const sizes = ["A3", "A4", "A5", "A6"];
    const materials = ["140 GSM Matte", "200 GSM Gloss", "300 GSM Premium", "Sunboard"];

    collections.forEach((collection) => {
        for (let i = 1; i <= 10; i++) {
            // Random price generation to make it look realistic
            const basePrice = Math.floor(Math.random() * (1500 - 800) + 800); // MRP between 800 and 1500
            const discount = Math.floor(Math.random() * (40 - 10) + 10); // 10% to 40% discount
            const sellingPrice = Math.floor(basePrice * (1 - discount / 100));

            // Unique ID
            const productId = `${collection.name.toLowerCase().replace(/ /g, "-")}-${i}`;

            // Dynamic Image (Pollinations AI)
            // Added variety to prompt so items look different
            const safeName = collection.name.replace(/ /g, "%20");
            const imageUrl = `https://image.pollinations.ai/prompt/${safeName}%20poster%20variant%20${i}%20aesthetic?width=400&height=600&nologo=true&seed=${productId}`;

            allProducts.push({
                id: productId,
                collectionId: collection.id,
                title: `${collection.name} Series - Design #${i}`,
                description: `Premium quality ${collection.name} art print. Features vivid colors and sharp details, perfect for modern home decor. Available in multiple sizes and material finishes to suit your style.`,
                price: basePrice, // MRP
                discountedPrice: sellingPrice, // Selling Price
                image: imageUrl,
                sizes: sizes,
                materials: materials,
                tags: [collection.name, "Poster", "Art", "Decor"]
            });
        }
    });

    return allProducts;
};

export const products = generateProducts();
