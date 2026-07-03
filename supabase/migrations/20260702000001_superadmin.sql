-- ============================================================================
-- Migration: SuperAdmin role
-- ============================================================================

-- เพิ่ม 'superadmin' เข้า enum admin_role
alter type admin_role add value if not exists 'superadmin';
