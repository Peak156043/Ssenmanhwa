import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Gate every /admin route except the login page itself behind a real
  // server-verified admin check, so the protection doesn't depend on any
  // client-side redirect that JavaScript could be tricked into skipping.
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {}, // response cookies already handled by updateSession above
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('id, last_login_at')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminRow) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'not_admin');
      return NextResponse.redirect(loginUrl);
    }

    // Session Timeout: Admin/SuperAdmin session expires 24 hours after last login
    if (adminRow.last_login_at) {
      const lastLogin = new Date(adminRow.last_login_at).getTime();
      const now = Date.now();
      const hoursSinceLogin = (now - lastLogin) / (1000 * 60 * 60);

      if (hoursSinceLogin > 24) {
        await supabase.auth.signOut();
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'session_expired');
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every route except static assets, so sessions stay fresh
     * everywhere, while keeping the admin check scoped to /admin above.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)',
  ],
};
