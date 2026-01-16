-- Admin RBAC & Profiles Schema

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email TEXT, -- Optional: verify if needed for easy querying, but auth.users is source of truth
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure email column exists (in case table already existed without it)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can view their own profile
CREATE POLICY "Public profiles are viewable by owner" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles (optional, for future user management)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- 4. Auto-Profile Creation Trigger
-- This trigger automatically assigns 'admin' role to specific emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email)
  VALUES (
    new.id,
    CASE 
      WHEN new.email IN ('gautaamrishi@gmail.com', 'wadheprerna@gmail.com') THEN 'admin'
      ELSE 'user'
    END,
    new.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Backfill for existing users (Run manually if needed)
-- This logic helps if users already exist in auth.users but not in profiles
INSERT INTO public.profiles (id, role, email)
SELECT 
    id, 
    CASE 
      WHEN email IN ('gautaamrishi@gmail.com', 'wadheprerna@gmail.com') THEN 'admin'
      ELSE 'user' 
    END,
    email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
