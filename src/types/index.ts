// Core domain types. These mirror the PostgreSQL schema in docs/database-schema.sql
// so the mock data layer can be swapped for real queries with no shape changes.

export type ManhwaStatus = 'ongoing' | 'completed' | 'hiatus';
export type ChapterStatus = 'draft' | 'published';

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Manhwa {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  coverImageUrl: string;
  status: ManhwaStatus;
  genres: Genre[];
  totalChapters: number;
  rating: number; // 0-5
  views: number;
  updatedAt: string; // ISO date
  createdAt: string;
}

export interface Chapter {
  id: string;
  manhwaId: string;
  chapterNumber: number; // supports 2.5-style numbering
  title: string;
  status: ChapterStatus;
  pageImageUrls: string[];
  publishedAt: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ReadingHistoryEntry {
  userId: string;
  manhwaId: string;
  lastChapterNumber: number;
  lastReadAt: string; // ISO date
  progressPercent: number; // 0-100, derived: lastChapterNumber / totalChapters
}

export interface Bookmark {
  userId: string;
  manhwaId: string;
  bookmarkedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'editor';
}

// Read receipts per-chapter, used to render "read" checkmarks in the episode list.
export interface ChapterReadState {
  userId: string;
  chapterId: string;
  readAt: string;
}
