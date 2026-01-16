import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake can make it very hard to debug
    // auth issues.

    const { data: { user } } = await supabase.auth.getUser();

    // Admin Route Protection
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // 1. Check if user is logged in
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }

        // 2. Check if user has admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            const url = request.nextUrl.clone();
            url.pathname = '/unauthorized';
            return NextResponse.redirect(url);
        }
    }

    // Login Redirect for Admin
    // If an admin logs in, we might want to redirect them? 
    // Actually, that logic is better placed in the login page component itself, not here, 
    // to avoid infinite loops or complex state management in middleware.

    return supabaseResponse;
}
