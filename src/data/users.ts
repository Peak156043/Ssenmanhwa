import { Bookmark, ReadingHistoryEntry, User } from '@/types';

// This represents the "currently logged in" demo user for the prototype.
export const currentUser: User = {
  id: 'u1',
  username: 'นักอ่านมังฮวา99',
  email: 'reader99@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  createdAt: '2025-03-12',
};

export const readingHistory: ReadingHistoryEntry[] = [
  {
    userId: 'u1',
    manhwaId: 'm1',
    lastChapterNumber: 62,
    lastReadAt: '2026-06-27T21:10:00+07:00',
    progressPercent: Math.round((62 / 87) * 100),
  },
  {
    userId: 'u1',
    manhwaId: 'm3',
    lastChapterNumber: 32,
    lastReadAt: '2026-06-26T13:40:00+07:00',
    progressPercent: 100,
  },
  {
    userId: 'u1',
    manhwaId: 'm4',
    lastChapterNumber: 15,
    lastReadAt: '2026-06-20T09:05:00+07:00',
    progressPercent: Math.round((15 / 120) * 100),
  },
  {
    userId: 'u1',
    manhwaId: 'm8',
    lastChapterNumber: 56,
    lastReadAt: '2026-06-23T18:22:00+07:00',
    progressPercent: 100,
  },
];

export const bookmarks: Bookmark[] = [
  { userId: 'u1', manhwaId: 'm1', bookmarkedAt: '2024-03-01' },
  { userId: 'u1', manhwaId: 'm2', bookmarkedAt: '2024-02-10' },
  { userId: 'u1', manhwaId: 'm6', bookmarkedAt: '2024-09-02' },
];

export function getHistoryForManhwa(manhwaId: string): ReadingHistoryEntry | undefined {
  return readingHistory.find((h) => h.manhwaId === manhwaId);
}

export function isBookmarked(manhwaId: string): boolean {
  return bookmarks.some((b) => b.manhwaId === manhwaId);
}
