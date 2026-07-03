-- Sample data for local development only. Applied automatically after
-- migrations whenever you run `supabase db reset`. Safe to delete or edit
-- freely — this never runs against a linked production project unless you
-- explicitly run `supabase db push` with this file included, which is not
-- the normal workflow (seed.sql is a local-only convenience).

insert into manhwa (slug, title, synopsis, cover_image_url, status)
values
  (
    'shadow-of-the-fallen-king',
    'เงาแห่งราชาผู้ล่วงลับ',
    'อดีตขุนพลผู้ถูกทรยศและสังหารกลับมาเกิดใหม่ในร่างของตนเองเมื่อ 10 ปีก่อนวันที่ราชอาณาจักรล่มสลาย เขาต้องไต่เต้าอำนาจอีกครั้งพร้อมความทรงจำแห่งอนาคต',
    'https://images.unsplash.com/photo-1601513237763-94b1c0fa3a5f?w=600&h=900&fit=crop',
    'ongoing'
  ),
  (
    'my-roommate-is-a-dragon',
    'รูมเมทของฉันคือมังกร',
    'นักศึกษาสาวธรรมดาดันไปปลุกมังกรโบราณที่หลับอยู่ใต้หอพักโดยไม่ตั้งใจ ตอนนี้เธอต้องอยู่ร่วมห้องกับมังกรในร่างหนุ่มหล่อ',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=900&fit=crop',
    'ongoing'
  ),
  (
    'the-last-station',
    'สถานีสุดท้าย',
    'เมื่อรถไฟใต้ดินสายเที่ยงคืนพาผู้โดยสารไปยังสถานีที่ไม่มีอยู่บนแผนที่ใด ทุกคนต้องเอาชีวิตรอดจากสิ่งที่ซ่อนอยู่ในความมืดของอุโมงค์',
    'https://images.unsplash.com/photo-1545156521-77bd85671d30?w=600&h=900&fit=crop',
    'ongoing'
  )
on conflict (slug) do nothing;

-- attach a couple of genres to each seeded manhwa
insert into manhwa_genres (manhwa_id, genre_id)
select m.id, g.id from manhwa m, genres g
where m.slug = 'shadow-of-the-fallen-king' and g.slug in ('fantasy', 'action')
on conflict do nothing;

insert into manhwa_genres (manhwa_id, genre_id)
select m.id, g.id from manhwa m, genres g
where m.slug = 'my-roommate-is-a-dragon' and g.slug in ('romance', 'comedy', 'fantasy')
on conflict do nothing;

insert into manhwa_genres (manhwa_id, genre_id)
select m.id, g.id from manhwa m, genres g
where m.slug = 'the-last-station' and g.slug in ('horror', 'drama')
on conflict do nothing;

-- a couple of published chapters with placeholder page images so the
-- viewer page has something to render during local testing
insert into chapters (manhwa_id, chapter_number, title, status, page_image_urls, published_at)
select m.id, 1, 'ตอนที่ 1', 'published',
  '["https://picsum.photos/seed/ch1-1/800/1200","https://picsum.photos/seed/ch1-2/800/1200","https://picsum.photos/seed/ch1-3/800/1200"]'::jsonb,
  now()
from manhwa m where m.slug = 'shadow-of-the-fallen-king'
on conflict do nothing;

insert into chapters (manhwa_id, chapter_number, title, status, page_image_urls, published_at)
select m.id, 2, 'ตอนที่ 2', 'published',
  '["https://picsum.photos/seed/ch2-1/800/1200","https://picsum.photos/seed/ch2-2/800/1200"]'::jsonb,
  now()
from manhwa m where m.slug = 'shadow-of-the-fallen-king'
on conflict do nothing;

insert into chapters (manhwa_id, chapter_number, title, status, page_image_urls, published_at)
select m.id, 1, 'ตอนที่ 1', 'published',
  '["https://picsum.photos/seed/dragon1-1/800/1200","https://picsum.photos/seed/dragon1-2/800/1200"]'::jsonb,
  now()
from manhwa m where m.slug = 'my-roommate-is-a-dragon'
on conflict do nothing;
