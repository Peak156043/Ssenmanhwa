-- เพิ่ม Genre 18+ เข้าไปในระบบ เพื่อใช้เป็นตัวกรองและเปิดใช้ระบบจำกัดอายุ
insert into genres (name, slug) values
  ('18+', '18-plus')
on conflict (slug) do nothing;
