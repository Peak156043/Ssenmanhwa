-- ============================================================================
-- Manhwa Reading Platform — PostgreSQL Schema
-- This is a READ-ONLY REFERENCE COPY for browsing. The file that actually
-- runs is supabase/migrations/20260101000000_initial_schema.sql — edit that
-- one (and re-copy here if you want this doc to stay in sync), since
-- `supabase db reset` and `supabase db push` only ever look at the
-- migrations folder, never at docs/.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm; -- for fast ILIKE / fuzzy title search

-- ----------------------------------------------------------------------------
-- USERS (profile table — identity itself lives in Supabase's auth.users)
-- Supabase Auth owns email + password (hashed, managed entirely by Supabase,
-- never touched directly). This table is a 1:1 profile row created
-- automatically by the trigger below whenever someone signs up, and is what
-- the rest of the schema (reading_history, bookmarks, chapter_reads)
-- references — never auth.users directly, so app code never needs
-- elevated privileges just to join against profile data.
-- ----------------------------------------------------------------------------
create table users (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_users_username on users (username);

-- Auto-create a profile row the moment someone signs up via Supabase Auth.
-- username defaults from the email's local part; the app can let the user
-- change it afterwards. Mirrors the standard Supabase "public profile" pattern.
create or replace function fn_handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (id, username)
  values (new.id, split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function fn_handle_new_auth_user();

-- ----------------------------------------------------------------------------
-- ADMIN USERS
-- Also backed by Supabase Auth (same login system, same auth.users table —
-- per product decision, admins and readers share one identity provider).
-- What makes someone an admin is *only* having a row here, keyed to their
-- auth.users id. Deliberately a separate table from `users`, not a `role`
-- column on it, so granting/revoking admin access is one insert/delete and
-- every privileged query is a single explicit join/EXISTS check — never a
-- column value an attacker could hope to flip via a mass-assignment bug.
-- ----------------------------------------------------------------------------
create type admin_role as enum ('admin', 'editor');

create table admin_users (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          admin_role not null default 'editor',
  granted_by    uuid references admin_users(id),
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- Helper used throughout RLS policies and server actions to check admin
-- status in one place. SECURITY DEFINER so RLS on admin_users itself
-- doesn't block the check from inside other policies.
create or replace function fn_is_admin(uid uuid)
returns boolean as $$
  select exists (select 1 from admin_users where id = uid);
$$ language sql security definer stable;

-- ----------------------------------------------------------------------------
-- GENRES
-- ----------------------------------------------------------------------------
create table genres (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique,
  slug  text not null unique
);

insert into genres (name, slug) values
  ('แฟนตาซี', 'fantasy'),
  ('แอ็คชั่น', 'action'),
  ('โรแมนซ์', 'romance'),
  ('ดราม่า', 'drama'),
  ('สยองขวัญ', 'horror'),
  ('คอมเมดี้', 'comedy'),
  ('ไซไฟ', 'sci-fi'),
  ('ต่อสู้', 'martial-arts')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- MANHWA
-- total_chapters and rating are denormalized counters, maintained by triggers
-- below, so the home page can list/filter/sort without a join + count on
-- every request as the catalogue grows.
-- ----------------------------------------------------------------------------
create type manhwa_status as enum ('ongoing', 'completed', 'hiatus');

create table manhwa (
  id                uuid primary key default uuid_generate_v4(),
  slug              text not null unique,
  title             text not null,
  synopsis          text not null default '',
  cover_image_url   text,
  status            manhwa_status not null default 'ongoing',
  total_chapters    integer not null default 0,   -- maintained by trigger, published chapters only
  views             bigint not null default 0,
  rating_sum        integer not null default 0,   -- maintained by trigger
  rating_count      integer not null default 0,   -- maintained by trigger
  created_by        uuid references admin_users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_manhwa_status on manhwa (status);
create index idx_manhwa_updated_at on manhwa (updated_at desc);
create index idx_manhwa_title_trgm on manhwa using gin (title gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- MANHWA <-> GENRES (many-to-many)
-- ----------------------------------------------------------------------------
create table manhwa_genres (
  manhwa_id  uuid not null references manhwa(id) on delete cascade,
  genre_id   uuid not null references genres(id) on delete cascade,
  primary key (manhwa_id, genre_id)
);

create index idx_manhwa_genres_genre on manhwa_genres (genre_id);

-- ----------------------------------------------------------------------------
-- CHAPTERS
-- chapter_number is numeric (not integer) to support "2.5"-style side chapters.
-- page_image_urls is stored as a JSONB ordered array (the order IS the page
-- order, drag-and-drop in the admin panel writes this array directly) rather
-- than a separate chapter_pages table — pages are never queried independently
-- of their chapter, so the join overhead of a child table buys nothing here.
-- ----------------------------------------------------------------------------
create type chapter_status as enum ('draft', 'published');

create table chapters (
  id               uuid primary key default uuid_generate_v4(),
  manhwa_id        uuid not null references manhwa(id) on delete cascade,
  chapter_number   numeric(6,1) not null,
  title            text not null default '',
  status           chapter_status not null default 'draft',
  page_image_urls  jsonb not null default '[]'::jsonb,
  created_by       uuid references admin_users(id),
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (manhwa_id, chapter_number)
);

create index idx_chapters_manhwa on chapters (manhwa_id, chapter_number desc);
create index idx_chapters_status on chapters (status);

-- ----------------------------------------------------------------------------
-- READING HISTORY
-- One row per (user, manhwa) holding only the furthest point reached —
-- this is what "กำลังอ่านอยู่" badges and the dashboard read from, and it's
-- the table that grows fastest as users return daily, so it's kept as narrow
-- as possible. Use chapter_reads below if you need full per-chapter logs.
-- ----------------------------------------------------------------------------
create table reading_history (
  user_id              uuid not null references users(id) on delete cascade,
  manhwa_id            uuid not null references manhwa(id) on delete cascade,
  last_chapter_number  numeric(6,1) not null,
  last_read_at         timestamptz not null default now(),
  primary key (user_id, manhwa_id)
);

create index idx_reading_history_user_recent on reading_history (user_id, last_read_at desc);

-- ----------------------------------------------------------------------------
-- CHAPTER READ RECEIPTS
-- Powers the per-episode checkmark in the episode list. Kept separate from
-- reading_history because this table can be pruned/archived independently
-- (e.g. keep only the last N reads per user) without losing the "currently
-- reading" signal that reading_history alone provides.
-- ----------------------------------------------------------------------------
create table chapter_reads (
  user_id     uuid not null references users(id) on delete cascade,
  chapter_id  uuid not null references chapters(id) on delete cascade,
  read_at     timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create index idx_chapter_reads_user on chapter_reads (user_id);

-- ----------------------------------------------------------------------------
-- BOOKMARKS
-- ----------------------------------------------------------------------------
create table bookmarks (
  user_id        uuid not null references users(id) on delete cascade,
  manhwa_id      uuid not null references manhwa(id) on delete cascade,
  bookmarked_at  timestamptz not null default now(),
  primary key (user_id, manhwa_id)
);

create index idx_bookmarks_user on bookmarks (user_id, bookmarked_at desc);

-- ============================================================================
-- TRIGGERS — keep denormalized counters correct without app-side bookkeeping
-- ============================================================================

-- Recompute manhwa.total_chapters whenever a chapter is published/unpublished
-- or deleted, so the homepage "ทั้งหมด N ตอน" badge never drifts from reality.
create or replace function fn_update_manhwa_chapter_count()
returns trigger as $$
begin
  update manhwa
  set total_chapters = (
        select count(*) from chapters
        where manhwa_id = coalesce(new.manhwa_id, old.manhwa_id)
          and status = 'published'
      ),
      updated_at = now()
  where id = coalesce(new.manhwa_id, old.manhwa_id);
  return null;
end;
$$ language plpgsql;

create trigger trg_chapters_count_insert_update
after insert or update of status on chapters
for each row execute function fn_update_manhwa_chapter_count();

create trigger trg_chapters_count_delete
after delete on chapters
for each row execute function fn_update_manhwa_chapter_count();

-- Auto-touch updated_at on manhwa edits.
create or replace function fn_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_manhwa_touch before update on manhwa
for each row execute function fn_touch_updated_at();

create trigger trg_chapters_touch before update on chapters
for each row execute function fn_touch_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (Supabase) — sketch only, tighten before production.
-- Public tables are world-readable; mutations require the matching admin
-- service role, kept entirely separate from the regular user JWT.
-- ============================================================================

alter table manhwa enable row level security;
alter table chapters enable row level security;
alter table reading_history enable row level security;
alter table bookmarks enable row level security;
alter table chapter_reads enable row level security;
alter table users enable row level security;
alter table admin_users enable row level security;

create policy "profiles are publicly readable"
  on users for select using (true);

create policy "users update their own profile"
  on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "admins can read the admin roster"
  on admin_users for select
  using (fn_is_admin(auth.uid()));

create policy "manhwa is publicly readable"
  on manhwa for select using (true);

create policy "admins can write manhwa"
  on manhwa for insert with check (fn_is_admin(auth.uid()));

create policy "admins can update manhwa"
  on manhwa for update
  using (fn_is_admin(auth.uid()))
  with check (fn_is_admin(auth.uid()));

create policy "admins can delete manhwa"
  on manhwa for delete using (fn_is_admin(auth.uid()));

create policy "only published chapters are publicly readable"
  on chapters for select
  using (status = 'published' or fn_is_admin(auth.uid()));

create policy "admins can write chapters"
  on chapters for insert with check (fn_is_admin(auth.uid()));

create policy "admins can update chapters"
  on chapters for update
  using (fn_is_admin(auth.uid()))
  with check (fn_is_admin(auth.uid()));

create policy "admins can delete chapters"
  on chapters for delete using (fn_is_admin(auth.uid()));

create policy "users manage their own reading history"
  on reading_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage their own bookmarks"
  on bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage their own read receipts"
  on chapter_reads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- All admin writes above check fn_is_admin(auth.uid()) against the
-- admin_users table, so granting access is purely a database operation
-- (insert a row) — there is no separate admin password or secondary auth
-- system to keep in sync.

-- ============================================================================
-- STORAGE — cover images and chapter page images
-- Run once per project; the Storage UI can also create buckets, but doing it
-- here keeps the whole schema reproducible from one script.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('manhwa-covers', 'manhwa-covers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('manhwa-pages', 'manhwa-pages', true)
on conflict (id) do nothing;

create policy "cover images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'manhwa-covers');

create policy "admins can upload cover images"
  on storage.objects for insert
  with check (bucket_id = 'manhwa-covers' and fn_is_admin(auth.uid()));

create policy "admins can delete cover images"
  on storage.objects for delete
  using (bucket_id = 'manhwa-covers' and fn_is_admin(auth.uid()));

create policy "page images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'manhwa-pages');

create policy "admins can upload page images"
  on storage.objects for insert
  with check (bucket_id = 'manhwa-pages' and fn_is_admin(auth.uid()));

create policy "admins can delete page images"
  on storage.objects for delete
  using (bucket_id = 'manhwa-pages' and fn_is_admin(auth.uid()));

-- ============================================================================
-- BOOTSTRAPPING YOUR FIRST ADMIN
-- There is no signup form for admins by design. Create the account through
-- normal Supabase Auth (sign up via the app's /register page), then find
-- that user's UUID:
--   - Local dev (Supabase CLI): open Studio at http://127.0.0.1:54323
--     -> Authentication -> Users -> copy the UUID
--   - Cloud or self-hosted server: open your project's dashboard ->
--     Authentication -> Users -> copy the UUID
-- Then run, in the SQL Editor (Studio) or via `supabase db ...` / psql:
--
--   insert into admin_users (id, role) values ('<UUID copied above>', 'admin');
--
-- From then on that account can log in at /admin/login and, since it's an
-- 'admin' role, can grant admin/editor access to others from the app itself.
-- ============================================================================

-- ============================================================================
-- ENTITY RELATIONSHIP SUMMARY
-- ============================================================================
-- auth.users (Supabase) 1 ──1 users           (profile, auto-created on signup)
-- auth.users (Supabase) 1 ──1 admin_users     (only present for admins/editors)
-- users            1 ──< reading_history >── 1 manhwa
-- users            1 ──< bookmarks       >── 1 manhwa
-- users            1 ──< chapter_reads   >── 1 chapters
-- manhwa           1 ──< chapters
-- manhwa           M ──< manhwa_genres >── M genres
-- admin_users      1 ──< manhwa (created_by)
-- admin_users      1 ──< chapters (created_by)
-- ============================================================================
