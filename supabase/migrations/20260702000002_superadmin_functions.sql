-- ============================================================================
-- Migration: SuperAdmin helper functions (must be separate from ALTER TYPE)
-- ============================================================================

create or replace function fn_is_superadmin(uid uuid)
returns boolean as $$
  select exists (select 1 from admin_users where id = uid and role = 'superadmin');
$$ language sql security definer stable;

create or replace function fn_get_admin_role(uid uuid)
returns text as $$
  select role::text from admin_users where id = uid;
$$ language sql security definer stable;
