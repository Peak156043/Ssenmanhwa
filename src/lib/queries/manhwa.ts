import { createClient } from '@/lib/supabase/server';
import { Manhwa, Chapter, Genre, ReadingHistoryEntry } from '@/types';

// These functions return the same shapes the mock data layer in src/data
// used to, so every component built against src/types/index.ts works
// unchanged — only the data source moved from in-memory arrays to Postgres.

function mapManhwaRow(row: any): Manhwa {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    synopsis: row.synopsis,
    coverImageUrl: row.cover_image_url ?? '',
    status: row.status,
    genres: (row.manhwa_genres ?? []).map((mg: any) => mg.genres).filter(Boolean),
    totalChapters: row.total_chapters,
    rating: row.rating_count > 0 ? row.rating_sum / row.rating_count : 0,
    views: row.views,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

function mapChapterRow(row: any): Chapter {
  return {
    id: row.id,
    manhwaId: row.manhwa_id,
    chapterNumber: row.chapter_number,
    title: row.title,
    status: row.status,
    pageImageUrls: row.page_image_urls ?? [],
    publishedAt: row.published_at,
    createdAt: row.created_at,
  };
}

export async function getAllGenres(): Promise<Genre[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('genres').select('*').order('name');
  const genres = ((data as any[]) ?? []).map((g) => ({ id: g.id, name: g.name, slug: g.slug }));
  
  const adultGenre = genres.find(g => g.slug === '18-plus');
  if (adultGenre) {
    return [...genres.filter(g => g.slug !== '18-plus'), adultGenre];
  }
  return genres;
}

export async function getAllManhwa(query?: string, status?: string): Promise<Manhwa[]> {
  const supabase = await createClient();
  let supabaseQuery = supabase
    .from('manhwa')
    .select('*, manhwa_genres(genres(*))')
    .order('updated_at', { ascending: false });

  if (query) {
    supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
  }
  if (status && status !== 'all') {
    supabaseQuery = supabaseQuery.eq('status', status);
  }

  const { data } = await supabaseQuery;
  return ((data as any[]) ?? []).map(mapManhwaRow);
}

export async function getManhwaBySlug(slug: string): Promise<Manhwa | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('manhwa')
    .select('*, manhwa_genres(genres(*))')
    .eq('slug', slug)
    .maybeSingle();
  return data ? mapManhwaRow(data) : null;
}

export async function getManhwaById(id: string): Promise<Manhwa | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('manhwa')
    .select('*, manhwa_genres(genres(*))')
    .eq('id', id)
    .maybeSingle();
  return data ? mapManhwaRow(data) : null;
}

/**
 * includeDrafts should only ever be true when the caller has already
 * confirmed admin access (requireAdmin()) — RLS also enforces this
 * server-side regardless, since the "published chapters are publicly
 * readable" policy allows drafts through only when fn_is_admin() is true
 * for the querying user.
 */
export async function getChaptersForManhwa(
  manhwaId: string,
  includeDrafts = false,
): Promise<Chapter[]> {
  const supabase = await createClient();
  let query = supabase
    .from('chapters')
    .select('*')
    .eq('manhwa_id', manhwaId)
    .order('chapter_number', { ascending: false });

  if (!includeDrafts) {
    query = query.eq('status', 'published');
  }

  const { data } = await query;
  return ((data as any[]) ?? []).map(mapChapterRow);
}

export async function getChapter(
  manhwaId: string,
  chapterNumber: number,
): Promise<Chapter | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('chapters')
    .select('*')
    .eq('manhwa_id', manhwaId)
    .eq('chapter_number', chapterNumber)
    .maybeSingle();
  return data ? mapChapterRow(data) : null;
}

export async function getReadingHistoryForCurrentUser(): Promise<ReadingHistoryEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: history } = await supabase
    .from('reading_history')
    .select('*, manhwa(total_chapters)')
    .eq('user_id', user.id)
    .order('last_read_at', { ascending: false });

  return (history ?? []).map((h: any) => ({
    userId: h.user_id,
    manhwaId: h.manhwa_id,
    lastChapterNumber: h.last_chapter_number,
    lastReadAt: h.last_read_at,
    progressPercent: h.manhwa?.total_chapters
      ? Math.round((h.last_chapter_number / h.manhwa.total_chapters) * 100)
      : 0,
  }));
}

export async function getHistoryForManhwa(manhwaId: string): Promise<ReadingHistoryEntry | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('reading_history')
    .select('*, manhwa(total_chapters)')
    .eq('user_id', user.id)
    .eq('manhwa_id', manhwaId)
    .maybeSingle();

  if (!data) return null;
  const anyData = data as any;
  const totalChapters = anyData.manhwa?.total_chapters ?? 0;
  return {
    userId: anyData.user_id,
    manhwaId: anyData.manhwa_id,
    lastChapterNumber: anyData.last_chapter_number,
    lastReadAt: anyData.last_read_at,
    progressPercent: totalChapters ? Math.round((anyData.last_chapter_number / totalChapters) * 100) : 0,
  };
}

export async function getBookmarkedManhwaIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase.from('bookmarks').select('manhwa_id').eq('user_id', user.id);
  return new Set(((data as any[]) ?? []).map((b) => b.manhwa_id));
}

export async function isBookmarked(manhwaId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('bookmarks')
    .select('manhwa_id')
    .eq('user_id', user.id)
    .eq('manhwa_id', manhwaId)
    .maybeSingle();
  return !!data;
}

export async function getBookmarkedManhwa(): Promise<Manhwa[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('bookmarks')
    .select('manhwa(*, manhwa_genres(genres(*)))')
    .eq('user_id', user.id)
    .order('bookmarked_at', { ascending: false });

  return ((data as any[]) ?? []).map((row: any) => mapManhwaRow(row.manhwa)).filter(Boolean);
}

/**
 * Returns the top N manhwa ordered by total views (descending).
 * Used for the "อ่านมากที่สุด" ranking on the homepage.
 */
export async function getTopManhwaByViews(limit: number = 5): Promise<Manhwa[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('manhwa')
    .select('*, manhwa_genres(genres(*))')
    .order('views', { ascending: false })
    .limit(limit);
  return ((data as any[]) ?? []).map(mapManhwaRow);
}

/**
 * Returns a page of manhwa ordered by most recently updated.
 * `page` is 0-indexed. Each page returns `pageSize` items.
 */
export async function getLatestUpdatedManhwa(
  page: number = 0,
  pageSize: number = 20,
): Promise<Manhwa[]> {
  const supabase = await createClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data } = await supabase
    .from('manhwa')
    .select('*, manhwa_genres(genres(*))')
    .order('updated_at', { ascending: false })
    .range(from, to);
  return ((data as any[]) ?? []).map(mapManhwaRow);
}

/**
 * Returns the total number of manhwa in the database.
 * Used to determine if there are more pages to load.
 */
export async function getTotalManhwaCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('manhwa')
    .select('*', { count: 'exact', head: true });
  return count ?? 0;
}

export type CommentWithUser = {
  id: string;
  chapter_id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

export async function getChapterComments(chapterId: string): Promise<CommentWithUser[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('chapter_comments')
    .select(`
      id, chapter_id, content, created_at,
      users:user_id (id, username, avatar_url)
    `)
    .eq('chapter_id', chapterId)
    .order('created_at', { ascending: false });

  // Transform data to match CommentWithUser interface
  return ((data as any[]) ?? []).map((row) => ({
    id: row.id,
    chapter_id: row.chapter_id,
    content: row.content,
    created_at: row.created_at,
    user: {
      id: row.users.id,
      username: row.users.username,
      avatar_url: row.users.avatar_url,
    },
  }));
}
