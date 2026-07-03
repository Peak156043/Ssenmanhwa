-- ============================================================================
-- Migration: เพิ่มฟีเจอร์ Rating, Comments, User Management, Audit Log,
--            Scheduled Publishing, Rate Limit Views
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RATE LIMIT สำหรับ View Tracking (ป้องกันบอทปั่นวิว)
-- เพิ่มคอลัมน์ IP เพื่อกรองการนับซ้ำจาก IP เดียวกัน
-- ----------------------------------------------------------------------------
alter table manhwa_views_log add column if not exists ip_hash text;
-- ป้องกันการนับซ้ำ: 1 IP ต่อ 1 เรื่อง ต่อ 1 ชั่วโมง
alter table manhwa_views_log add column if not exists hour_bucket text;
create unique index if not exists idx_views_log_unique_hourly
  on manhwa_views_log (manhwa_id, ip_hash, hour_bucket)
  where ip_hash is not null;

-- อัพเดทฟังก์ชัน aggregate ให้ลบเฉพาะข้อมูลที่ประมวลผลแล้ว
create or replace function fn_aggregate_views()
returns void as $$
declare
  cutoff timestamptz := now();
begin
  update manhwa
  set views = manhwa.views + log_counts.view_count
  from (
    select manhwa_id, count(*) as view_count
    from manhwa_views_log
    where viewed_at <= cutoff
    group by manhwa_id
  ) as log_counts
  where manhwa.id = log_counts.manhwa_id;

  delete from manhwa_views_log where viewed_at <= cutoff;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------------------
-- 2. RATINGS (ให้คะแนนดาว)
-- ----------------------------------------------------------------------------
create table if not exists ratings (
  user_id    uuid not null references users(id) on delete cascade,
  manhwa_id  uuid not null references manhwa(id) on delete cascade,
  score      smallint not null check (score >= 1 and score <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, manhwa_id)
);

alter table ratings enable row level security;
create policy "users manage their own ratings"
  on ratings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger: เมื่อมีการให้คะแนน ให้อัพเดท rating_sum/rating_count ใน manhwa
create or replace function fn_update_manhwa_rating()
returns trigger as $$
begin
  update manhwa
  set rating_sum = coalesce((select sum(score) from ratings where manhwa_id = coalesce(new.manhwa_id, old.manhwa_id)), 0),
      rating_count = coalesce((select count(*) from ratings where manhwa_id = coalesce(new.manhwa_id, old.manhwa_id)), 0)
  where id = coalesce(new.manhwa_id, old.manhwa_id);
  return null;
end;
$$ language plpgsql;

create trigger trg_ratings_update
after insert or update or delete on ratings
for each row execute function fn_update_manhwa_rating();

-- ----------------------------------------------------------------------------
-- 3. COMMENTS (ความคิดเห็น)
-- ----------------------------------------------------------------------------
create table if not exists comments (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references users(id) on delete cascade,
  manhwa_id  uuid not null references manhwa(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_comments_manhwa on comments (manhwa_id, created_at desc);
create index idx_comments_chapter on comments (chapter_id, created_at desc);
create index idx_comments_user on comments (user_id);

alter table comments enable row level security;
create policy "comments are publicly readable"
  on comments for select using (true);
create policy "users can insert their own comments"
  on comments for insert with check (auth.uid() = user_id);
create policy "users can update their own comments"
  on comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "users or admins can delete comments"
  on comments for delete
  using (auth.uid() = user_id or fn_is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 4. USER MANAGEMENT (เพิ่มระบบแบน/ระงับ)
-- ----------------------------------------------------------------------------
alter table users add column if not exists is_banned boolean not null default false;
alter table users add column if not exists banned_at timestamptz;
alter table users add column if not exists ban_reason text;

-- ----------------------------------------------------------------------------
-- 5. NOTIFICATIONS (แจ้งเตือน)
-- ----------------------------------------------------------------------------
create table if not exists notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references users(id) on delete cascade,
  type       text not null,           -- 'new_chapter', 'reply', 'system'
  title      text not null,
  message    text not null default '',
  link       text,                    -- URL ที่จะพาไปเมื่อกดแจ้งเตือน
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications (user_id, is_read, created_at desc);

alter table notifications enable row level security;
create policy "users read their own notifications"
  on notifications for select using (auth.uid() = user_id);
create policy "users update their own notifications"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. SCHEDULED PUBLISHING (ตั้งเวลาเผยแพร่)
-- ----------------------------------------------------------------------------
alter table chapters add column if not exists scheduled_at timestamptz;

-- ฟังก์ชันสำหรับเผยแพร่ตอนที่ถึงกำหนดเวลา
create or replace function fn_publish_scheduled_chapters()
returns void as $$
begin
  update chapters
  set status = 'published',
      published_at = now()
  where status = 'draft'
    and scheduled_at is not null
    and scheduled_at <= now();
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------------------
-- 7. AUDIT LOG (บันทึกกิจกรรม Admin)
-- ----------------------------------------------------------------------------
create table if not exists audit_log (
  id         uuid primary key default uuid_generate_v4(),
  admin_id   uuid not null references admin_users(id),
  action     text not null,           -- 'create_manhwa', 'delete_chapter', 'ban_user', etc.
  target_type text,                   -- 'manhwa', 'chapter', 'user'
  target_id  text,                    -- ID ของสิ่งที่ถูกกระทำ
  details    jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_log_admin on audit_log (admin_id, created_at desc);
create index idx_audit_log_time on audit_log (created_at desc);

alter table audit_log enable row level security;
create policy "admins can read audit log"
  on audit_log for select using (fn_is_admin(auth.uid()));
create policy "admins can insert audit log"
  on audit_log for insert with check (fn_is_admin(auth.uid()));
