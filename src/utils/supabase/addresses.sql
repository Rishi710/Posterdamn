-- OPTION A: UPDATE EXISTING TABLE (Use this if you have data you want to keep)
-- ALTER TABLE addresses ADD COLUMN IF NOT EXISTS landmark TEXT;
-- ALTER TABLE addresses ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'IN';
-- NOTIFY: After running this, go to Supabase Dashboard > API Settings > PostgREST and click "Reload Schema" if the error persists.

-- OPTION B: FRESH START (Recommended for cleanest structure)
-- WARNING: This will delete all existing addresses!

DROP TABLE IF EXISTS addresses;

CREATE TABLE addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'Home',
    name TEXT NOT NULL,
    street TEXT NOT NULL,
    landmark TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'IN',
    zip TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own addresses" ON addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON addresses
    FOR DELETE USING (auth.uid() = user_id);
