-- ============================================================================
-- CHAPTER COMMENTS
-- Enables users to post comments on specific chapters.
-- ============================================================================

create table if not exists chapter_comments (
  id          uuid primary key default uuid_generate_v4(),
  chapter_id  uuid not null references chapters(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_chapter_comments_chapter on chapter_comments(chapter_id, created_at desc);

-- Auto-touch updated_at on comment edits.
create trigger trg_chapter_comments_touch before update on chapter_comments
for each row execute function fn_touch_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table chapter_comments enable row level security;

create policy "comments are publicly readable"
  on chapter_comments for select using (true);

create policy "users can insert their own comments"
  on chapter_comments for insert
  with check (auth.uid() = user_id);

create policy "users can update their own comments"
  on chapter_comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete their own comments"
  on chapter_comments for delete
  using (auth.uid() = user_id or fn_is_admin(auth.uid()));
