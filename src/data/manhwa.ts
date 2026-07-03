import { Genre, Manhwa } from '@/types';

export const genres: Genre[] = [
  { id: 'g1', name: 'แฟนตาซี', slug: 'fantasy' },
  { id: 'g2', name: 'แอ็คชั่น', slug: 'action' },
  { id: 'g3', name: 'โรแมนซ์', slug: 'romance' },
  { id: 'g4', name: 'ดราม่า', slug: 'drama' },
  { id: 'g5', name: 'สยองขวัญ', slug: 'horror' },
  { id: 'g6', name: 'คอมเมดี้', slug: 'comedy' },
  { id: 'g7', name: 'ไซไฟ', slug: 'sci-fi' },
  { id: 'g8', name: 'ต่อสู้', slug: 'martial-arts' },
];

const g = (...slugs: string[]) =>
  genres.filter((genre) => slugs.includes(genre.slug));

export const manhwaList: Manhwa[] = [
  {
    id: 'm1',
    slug: 'shadow-of-the-fallen-king',
    title: 'เงาแห่งราชาผู้ล่วงลับ',
    synopsis:
      'อดีตขุนพลผู้ถูกทรยศและสังหารกลับมาเกิดใหม่ในร่างของตนเองเมื่อ 10 ปีก่อนวันที่ราชอาณาจักรล่มสลาย เขาต้องไต่เต้าอำนาจอีกครั้งพร้อมความทรงจำแห่งอนาคต เพื่อเปลี่ยนชะตาของทุกคนที่เขารัก',
    coverImageUrl: 'https://images.unsplash.com/photo-1601513237763-94b1c0fa3a5f?w=600&h=900&fit=crop',
    status: 'ongoing',
    genres: g('fantasy', 'action'),
    totalChapters: 87,
    rating: 4.8,
    views: 2840000,
    updatedAt: '2026-06-26',
    createdAt: '2023-02-10',
  },
  {
    id: 'm2',
    slug: 'my-roommate-is-a-dragon',
    title: 'รูมเมทของฉันคือมังกร',
    synopsis:
      'นักศึกษาสาวธรรมดาดันไปปลุกมังกรโบราณที่หลับอยู่ใต้หอพักโดยไม่ตั้งใจ ตอนนี้เธอต้องอยู่ร่วมห้องกับมังกรในร่างหนุ่มหล่อที่ไม่รู้จักกฎมนุษย์เลยแม้แต่น้อย',
    coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=900&fit=crop',
    status: 'ongoing',
    genres: g('romance', 'comedy', 'fantasy'),
    totalChapters: 45,
    rating: 4.6,
    views: 1920000,
    updatedAt: '2026-06-25',
    createdAt: '2024-01-05',
  },
  {
    id: 'm3',
    slug: 'the-last-station',
    title: 'สถานีสุดท้าย',
    synopsis:
      'เมื่อรถไฟใต้ดินสายเที่ยงคืนพาผู้โดยสารไปยังสถานีที่ไม่มีอยู่บนแผนที่ใด ทุกคนต้องเอาชีวิตรอดจากสิ่งที่ซ่อนอยู่ในความมืดของอุโมงค์ ก่อนรุ่งเช้าจะมาถึง',
    coverImageUrl: 'https://images.unsplash.com/photo-1545156521-77bd85671d30?w=600&h=900&fit=crop',
    status: 'ongoing',
    genres: g('horror', 'drama'),
    totalChapters: 32,
    rating: 4.9,
    views: 3150000,
    updatedAt: '2026-06-27',
    createdAt: '2023-09-18',
  },
  {
    id: 'm4',
    slug: 'iron-fist-academy',
    title: 'สถาบันหมัดเหล็ก',
    synopsis:
      'ในโลกที่พลังหมัดตัดสินทุกอย่าง เด็กชายไร้พรสวรรค์คนหนึ่งสมัครเข้าสถาบันการต่อสู้อันดับหนึ่ง ด้วยความตั้งใจเดียวคือพิสูจน์ว่าความพยายามเอาชนะสายเลือดได้',
    coverImageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&h=900&fit=crop',
    status: 'ongoing',
    genres: g('action', 'martial-arts'),
    totalChapters: 120,
    rating: 4.7,
    views: 4200000,
    updatedAt: '2026-06-26',
    createdAt: '2022-04-01',
  },
  {
    id: 'm5',
    slug: 'paper-moon-letters',
    title: 'จดหมายจันทร์กระดาษ',
    synopsis:
      'เรื่องราวความรักที่เดินทางผ่านจดหมายระหว่างนักเขียนสาวผู้กักตัวเองในบ้านริมทะเล และทหารหนุ่มที่ไม่เคยเปิดเผยหน้าตาจริง พวกเขาตกหลุมรักกันผ่านตัวอักษร แต่ความจริงอาจเปลี่ยนทุกอย่าง',
    coverImageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=900&fit=crop',
    status: 'completed',
    genres: g('romance', 'drama'),
    totalChapters: 64,
    rating: 4.9,
    views: 2670000,
    updatedAt: '2026-04-12',
    createdAt: '2021-11-22',
  },
  {
    id: 'm6',
    slug: 'orbit-zero',
    title: 'ออร์บิตซีโร่',
    synopsis:
      'ปี 2199 มนุษยชาติกระจัดกระจายอยู่ตามสถานีอวกาศหลังโลกไม่อาจอยู่อาศัยได้อีกต่อไป นักบินอวกาศหญิงผู้ถูกกล่าวหาว่าทำลายสถานีบ้านเกิด ต้องเดินทางเพื่อพิสูจน์ความจริงที่ถูกฝังไว้',
    coverImageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=900&fit=crop',
    status: 'ongoing',
    genres: g('sci-fi', 'action', 'drama'),
    totalChapters: 28,
    rating: 4.5,
    views: 980000,
    updatedAt: '2026-06-24',
    createdAt: '2024-08-30',
  },
  {
    id: 'm7',
    slug: 'the-grocers-curse',
    title: 'คำสาปร้านชำ',
    synopsis:
      'ร้านชำเล็กๆ ที่เปิดมาตั้งแต่สมัยปู่ ขายของได้ทุกอย่างตามที่ลูกค้าต้องการ แต่ของทุกอย่างมีราคาที่ต้องจ่ายซึ่งไม่ใช่เงิน เด็กสาวผู้สืบทอดร้านต้องเรียนรู้กฎที่ปู่ไม่เคยบอก',
    coverImageUrl: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=600&h=900&fit=crop',
    status: 'hiatus',
    genres: g('horror', 'fantasy', 'comedy'),
    totalChapters: 19,
    rating: 4.4,
    views: 650000,
    updatedAt: '2026-03-02',
    createdAt: '2024-05-14',
  },
  {
    id: 'm8',
    slug: 'second-life-chef',
    title: 'เชฟชาติที่สอง',
    synopsis:
      'เชฟมิชลินสตาร์ที่ตายจากอุบัติเหตุในครัว ตื่นขึ้นมาในร่างของลูกชายตระกูลพ่อค้าล้มละลายยุคโบราณ เขาใช้ความรู้การทำอาหารชาติที่แล้วพลิกฟื้นกิจการร้านอาหารของตระกูล',
    coverImageUrl: 'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=600&h=900&fit=crop',
    status: 'ongoing',
    genres: g('comedy', 'drama', 'fantasy'),
    totalChapters: 56,
    rating: 4.7,
    views: 1540000,
    updatedAt: '2026-06-23',
    createdAt: '2023-12-01',
  },
];

export function getManhwaBySlug(slug: string): Manhwa | undefined {
  return manhwaList.find((m) => m.slug === slug);
}

export function getManhwaById(id: string): Manhwa | undefined {
  return manhwaList.find((m) => m.id === id);
}
