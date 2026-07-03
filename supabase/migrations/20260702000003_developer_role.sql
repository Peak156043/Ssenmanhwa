-- ============================================================================
-- Migration: Developer role
-- ============================================================================

-- เพิ่ม 'developer' เข้า enum admin_role
alter type admin_role add value if not exists 'developer';
