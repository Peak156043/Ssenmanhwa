import { Chapter } from '@/types';
import { manhwaList } from './manhwa';

// Deterministic placeholder page images per chapter (vertical webtoon-style panels).
function buildPages(seed: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const picId = (seed * 37 + i * 13) % 1000;
    return `https://picsum.photos/seed/${picId}-page${i}/800/1200`;
  });
}

function buildChaptersForManhwa(
  manhwaId: string,
  total: number,
  draftCount: number,
): Chapter[] {
  const chapters: Chapter[] = [];
  for (let n = 1; n <= total; n++) {
    const isDraft = n > total - draftCount;
    const daysAgo = (total - n) * 4;
    const publishedDate = new Date();
    publishedDate.setDate(publishedDate.getDate() - daysAgo);

    chapters.push({
      id: `${manhwaId}-ch${n}`,
      manhwaId,
      chapterNumber: n,
      title: `ตอนที่ ${n}`,
      status: isDraft ? 'draft' : 'published',
      pageImageUrls: buildPages(n, 14 + (n % 5)),
      publishedAt: isDraft ? null : publishedDate.toISOString(),
      createdAt: publishedDate.toISOString(),
    });
  }
  return chapters.reverse(); // latest first
}

export const chaptersByManhwa: Record<string, Chapter[]> = manhwaList.reduce(
  (acc, m) => {
    // give each series 1-2 draft chapters waiting to publish, for the admin demo
    acc[m.id] = buildChaptersForManhwa(m.id, m.totalChapters, m.id === 'm1' ? 2 : 1);
    return acc;
  },
  {} as Record<string, Chapter[]>,
);

export function getChaptersForManhwa(manhwaId: string, includeDrafts = false): Chapter[] {
  const chapters = chaptersByManhwa[manhwaId] || [];
  return includeDrafts ? chapters : chapters.filter((c) => c.status === 'published');
}

export function getChapter(manhwaId: string, chapterNumber: number): Chapter | undefined {
  return (chaptersByManhwa[manhwaId] || []).find((c) => c.chapterNumber === chapterNumber);
}
