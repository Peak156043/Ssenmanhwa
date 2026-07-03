-- ตารางเก็บ log การอ่านรายครั้งแบบเร็ว (Append-only)
create table manhwa_views_log (
  id uuid primary key default uuid_generate_v4(),
  manhwa_id uuid not null references manhwa(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

-- Index สำหรับการรวมข้อมูลตามเรื่องและเวลาเพื่อลบข้อมูลเก่า
create index idx_manhwa_views_log_manhwa on manhwa_views_log (manhwa_id);
create index idx_manhwa_views_log_time on manhwa_views_log (viewed_at);

-- อนุญาตให้ทุกคนสามารถ insert ได้ผ่านแอป (Anonymous / Logged-in)
alter table manhwa_views_log enable row level security;
create policy "anyone can insert view logs" on manhwa_views_log for insert with check (true);
create policy "only admins can view logs" on manhwa_views_log for select using (fn_is_admin(auth.uid()));

-- ฟังก์ชันรวบรวมยอดอ่านไปบวกเพิ่มในตาราง manhwa แล้วลบ log เก่าทิ้ง
create or replace function fn_aggregate_views()
returns void as $$
begin
  -- อัพเดทยอด views ของมังฮวาแต่ละเรื่องจาก log ที่ค้างอยู่
  update manhwa
  set views = manhwa.views + log_counts.view_count
  from (
    select manhwa_id, count(*) as view_count
    from manhwa_views_log
    group by manhwa_id
  ) as log_counts
  where manhwa.id = log_counts.manhwa_id;

  -- เคลียร์ log ที่เอาไปบวกเรียบร้อยแล้ว
  delete from manhwa_views_log;
end;
$$ language plpgsql security definer;
