import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // เช็คว่าถูกแบนหรือไม่
      const { data: profile } = await supabase
        .from('users')
        .select('is_banned')
        .eq('id', user.id)
        .maybeSingle();

      if ((profile as any)?.is_banned) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=banned`);
      }

      // เช็ค role — redirect ตามสิทธิ์
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (adminRow) {
        return NextResponse.redirect(`${origin}/admin`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
