import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/';
    const type = searchParams.get('type');

    // Force redirect to reset-password if this is a recovery flow
    const finalNext = type === 'recovery' ? '/reset-password' : next;

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {

            const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development';

            if (isLocalEnv) {
                return NextResponse.redirect(new URL(finalNext, origin));
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${finalNext}`);
            } else {
                return NextResponse.redirect(new URL(finalNext, origin));
            }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            return NextResponse.redirect(new URL(finalNext, origin));
        }

        console.error("Auth Error:", error);
        // Better to show an error page than silently landing on home
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    // No code present: Redirect to error page
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
