import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  try {
    // ตรวจสอบ CRON_SECRET เพื่อป้องกันการเรียกจากภายนอก
    // Vercel Cron จะส่ง Authorization header มาให้อัตโนมัติ
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabaseAdmin.rpc('fn_aggregate_views');

    if (error) {
      console.error('Error aggregating views:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Views aggregated successfully' });
  } catch (err: any) {
    console.error('Cron job failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
