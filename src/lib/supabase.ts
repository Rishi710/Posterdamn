import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate URL format
const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
    console.error('CRITICAL: Supabase configuration is invalid. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.');
} else {
    console.log('Supabase client initialized with URL:', supabaseUrl.substring(0, 15) + '...');
}

export const supabase = createClient(
    isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
