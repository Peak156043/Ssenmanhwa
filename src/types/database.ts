// Hand-written to match docs/database-schema.sql. In a real project, replace
// this with the auto-generated version: `npx supabase gen types typescript
// --project-id <ref> > src/types/database.ts` — keep the same filename so no
// imports elsewhere need to change.

export type ManhwaStatusDb = 'ongoing' | 'completed' | 'hiatus';
export type ChapterStatusDb = 'draft' | 'published';
export type AdminRoleDb = 'admin' | 'editor' | 'superadmin' | 'developer';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          is_banned: boolean;
          banned_at: string | null;
          ban_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          is_banned?: boolean;
          banned_at?: string | null;
          ban_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          is_banned?: boolean;
          banned_at?: string | null;
          ban_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          role: AdminRoleDb;
          granted_by: string | null;
          created_at: string;
          last_login_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['admin_users']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['admin_users']['Row']>;
      };
      genres: {
        Row: { id: string; name: string; slug: string };
        Insert: Partial<Database['public']['Tables']['genres']['Row']> & { name: string; slug: string };
        Update: Partial<Database['public']['Tables']['genres']['Row']>;
      };
      manhwa: {
        Row: {
          id: string;
          slug: string;
          title: string;
          synopsis: string;
          cover_image_url: string | null;
          status: ManhwaStatusDb;
          total_chapters: number;
          views: number;
          rating_sum: number;
          rating_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['manhwa']['Row']> & { slug: string; title: string };
        Update: Partial<Database['public']['Tables']['manhwa']['Row']>;
      };
      manhwa_genres: {
        Row: { manhwa_id: string; genre_id: string };
        Insert: { manhwa_id: string; genre_id: string };
        Update: Partial<{ manhwa_id: string; genre_id: string }>;
      };
      chapters: {
        Row: {
          id: string;
          manhwa_id: string;
          chapter_number: number;
          title: string;
          status: ChapterStatusDb;
          page_image_urls: string[];
          created_by: string | null;
          published_at: string | null;
          scheduled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['chapters']['Row']> & {
          manhwa_id: string;
          chapter_number: number;
        };
        Update: Partial<Database['public']['Tables']['chapters']['Row']>;
      };
      reading_history: {
        Row: {
          user_id: string;
          manhwa_id: string;
          last_chapter_number: number;
          last_read_at: string;
        };
        Insert: Database['public']['Tables']['reading_history']['Row'];
        Update: Partial<Database['public']['Tables']['reading_history']['Row']>;
      };
      chapter_reads: {
        Row: { user_id: string; chapter_id: string; read_at: string };
        Insert: Database['public']['Tables']['chapter_reads']['Row'];
        Update: Partial<Database['public']['Tables']['chapter_reads']['Row']>;
      };
      bookmarks: {
        Row: { user_id: string; manhwa_id: string; bookmarked_at: string };
        Insert: Database['public']['Tables']['bookmarks']['Row'];
        Update: Partial<Database['public']['Tables']['bookmarks']['Row']>;
      };
      chapter_comments: {
        Row: {
          id: string;
          chapter_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
