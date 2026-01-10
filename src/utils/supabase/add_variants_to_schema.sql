-- Add size and material columns to cart_items
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS material TEXT;

-- Add size and material columns to wishlist_items
ALTER TABLE wishlist_items 
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS material TEXT;

-- Add size and material columns to order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS material TEXT;
