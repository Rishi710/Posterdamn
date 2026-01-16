-- DANGER: This script resets the inventory tables. 
-- Use this to set up the complete schema with Collections and Categories.

-- 1. Drop existing tables to ensure clean state (Optional, remove if you want to preserve data)
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- 2. Create Metadata Tables
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Products Table with Relations
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Foreign Keys for Metadata
    collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    
    -- Keep text fields for fallback/display if needed, or remove them. 
    -- For this implementation, we will use the relations.
    
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    material TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER DEFAULT 100,
    sku TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, size, material)
);

-- 5. Enable Row Level Security
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Permissive for Development/Admin)

-- Collections
CREATE POLICY "Public collections are viewable" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Admins can manage collections" ON public.collections FOR ALL USING (true); -- Relaxed for now

-- Categories
CREATE POLICY "Public categories are viewable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (true); -- Relaxed for now

-- Products
CREATE POLICY "Public products are viewable" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (true); -- Relaxed for now

-- Variants
CREATE POLICY "Public variants are viewable" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage variants" ON public.product_variants FOR ALL USING (true); -- Relaxed for now

-- 7. Create Indexes
CREATE INDEX IF NOT EXISTS products_collection_id_idx ON public.products(collection_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS variants_product_id_idx ON public.product_variants(product_id);
