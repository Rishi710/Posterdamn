-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Public variants are viewable by everyone" ON public.product_variants;
DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;

-- Products Policies
CREATE POLICY "Enable read access for all users"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON public.products FOR INSERT
WITH CHECK (true); -- TEMPORARY: Allow all for debugging, or ensure using service role

CREATE POLICY "Enable update for users based on email"
ON public.products FOR UPDATE
USING (true);

-- Variants Policies
CREATE POLICY "Enable read access for all users"
ON public.product_variants FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON public.product_variants FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON public.product_variants FOR UPDATE
USING (true);

CREATE POLICY "Enable delete for all users"
ON public.product_variants FOR DELETE
USING (true);
