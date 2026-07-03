-- 1. Create table for daily views
create table if not exists daily_view_stats (
  id uuid primary key default uuid_generate_v4(),
  view_date date not null default current_date,
  view_count integer not null default 0,
  unique (view_date)
);

-- Allow reading
alter table daily_view_stats enable row level security;
create policy "only admins can view daily_view_stats" on daily_view_stats for select using (fn_is_admin(auth.uid()));

-- 2. Modify the fn_aggregate_views to also log daily views
create or replace function fn_aggregate_views()
returns void as $$
declare
  total_views integer := 0;
begin
  -- 2.1 Calculate total views to add today
  select count(*) into total_views from manhwa_views_log;

  -- 2.2 Update manhwa table
  update manhwa
  set views = manhwa.views + log_counts.view_count
  from (
    select manhwa_id, count(*) as view_count
    from manhwa_views_log
    group by manhwa_id
  ) as log_counts
  where manhwa.id = log_counts.manhwa_id;

  -- 2.3 Record daily views (upsert)
  if total_views > 0 then
    insert into daily_view_stats (view_date, view_count)
    values (current_date, total_views)
    on conflict (view_date) 
    do update set view_count = daily_view_stats.view_count + excluded.view_count;
  end if;

  -- 2.4 Clear log
  delete from manhwa_views_log;
end;
$$ language plpgsql security definer;
