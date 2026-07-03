'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { subDays, subMonths } from 'date-fns';

export type DashboardPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export async function getDashboardStatsAction(period: DashboardPeriod) {
  await requireAdmin();
  const supabase = await createClient();
  
  let startDate = new Date();
  if (period === 'daily') startDate = subDays(startDate, 14); // Last 14 days
  else if (period === 'weekly') startDate = subDays(startDate, 90); // Last 90 days
  else if (period === 'monthly') startDate = subMonths(startDate, 12); // Last 12 months
  else if (period === 'yearly') startDate = subMonths(startDate, 60); // Last 5 years
  
  const startDateStr = startDate.toISOString();

  // Fetch data concurrently
  const [views, users, comments, bookmarks, manhwas] = await Promise.all([
    supabase.from('daily_view_stats').select('view_date, view_count').gte('view_date', startDateStr),
    supabase.from('users').select('created_at').gte('created_at', startDateStr),
    supabase.from('comments').select('created_at').gte('created_at', startDateStr),
    supabase.from('bookmarks').select('created_at').gte('created_at', startDateStr),
    supabase.from('manhwa').select('created_at').gte('created_at', startDateStr),
  ]);

  return {
    views: views.data || [],
    users: users.data || [],
    comments: comments.data || [],
    bookmarks: bookmarks.data || [],
    manhwas: manhwas.data || [],
  };
}
