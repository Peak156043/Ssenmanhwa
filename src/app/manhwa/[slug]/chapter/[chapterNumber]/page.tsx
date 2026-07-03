import { getManhwaBySlug, getChaptersForManhwa, getChapter } from '@/lib/queries/manhwa';
import { notFound, redirect } from 'next/navigation';
import { ViewerToolbar } from '@/components/viewer/ViewerToolbar';
import { PageReader } from '@/components/viewer/PageReader';
import { ChapterReadTracker } from '@/components/viewer/ChapterReadTracker';
import { ScrollToTop } from '@/components/viewer/ScrollToTop';
import { CommentSection } from '@/components/viewer/CommentSection';
import { createClient } from '@/lib/supabase/server';

interface ViewerPageProps {
  params: Promise<{ slug: string; chapterNumber: string }>;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { slug, chapterNumber: chapterNumberParam } = await params;
  const manhwa = await getManhwaBySlug(slug);
  if (!manhwa) notFound();

  const is18Plus = manhwa.genres.some((g) => g.slug === '18-plus');
  if (is18Plus) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      redirect(`/login?next=/manhwa/${slug}`);
    }
  }

  const chapterNumber = Number(chapterNumberParam);
  const chapter = await getChapter(manhwa.id, chapterNumber);
  if (!chapter || chapter.status !== 'published') notFound();

  // Fetch comments
  const { getChapterComments } = await import('@/lib/queries/manhwa');
  const comments = await getChapterComments(chapter.id);

  // Get current user id and admin status for comments
  const { getAdminStatus } = await import('@/lib/auth');
  const adminStatus = await getAdminStatus();
  const currentUser = adminStatus ? adminStatus.authUser : null;
  const isAdmin = !!adminStatus;

  // If no admin status, we still need to check if normal user is logged in
  let currentUserId = currentUser?.id;
  if (!currentUserId) {
    const supabaseForUser = await createClient();
    const { data: { user } } = await supabaseForUser.auth.getUser();
    currentUserId = user?.id;
  }

  const allChapters = (await getChaptersForManhwa(manhwa.id)).sort(
    (a, b) => a.chapterNumber - b.chapterNumber,
  );

  return (
    <div className="bg-ink-950">
      {/* Fires the reading-history/read-receipt server action once this
          chapter has mounted; silently no-ops for logged-out readers. */}
      <ChapterReadTracker
        manhwaId={manhwa.id}
        manhwaSlug={manhwa.slug}
        chapterId={chapter.id}
        chapterNumber={chapter.chapterNumber}
      />

      <ViewerToolbar
        manhwaSlug={manhwa.slug}
        manhwaTitle={manhwa.title}
        currentChapter={chapter}
        allChapters={allChapters}
        position="top"
      />

      <PageReader 
        pageImageUrls={chapter.pageImageUrls} 
        manhwaId={manhwa.id} 
        chapterId={chapter.id} 
      />

      <ViewerToolbar
        manhwaSlug={manhwa.slug}
        manhwaTitle={manhwa.title}
        currentChapter={chapter}
        allChapters={allChapters}
        position="bottom"
      />

      <CommentSection 
        chapterId={chapter.id} 
        comments={comments} 
        currentUserId={currentUserId}
        isAdmin={isAdmin} 
        manhwaSlug={manhwa.slug}
      />

      <ScrollToTop />
    </div>
  );
}
