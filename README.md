# จิบมังฮวา — Manhwa Reading Platform

เว็บไซต์อ่านมังฮวาแบบเต็มระบบ สร้างด้วย **Next.js 15 (App Router) + TypeScript +
Tailwind CSS** ต่อ backend ด้วย **Supabase** (PostgreSQL + Auth + Storage)
ผู้ใช้ทั่วไปและผู้ดูแลระบบใช้ระบบ login เดียวกัน (Supabase Auth) — สิ่งที่ทำให้
บัญชีหนึ่งเป็น "แอดมิน" คือการมีแถวอยู่ในตาราง `admin_users` เท่านั้น

**Database รันบนเครื่อง local ของคุณเองทั้งหมด** ผ่าน Supabase CLI (ใช้ Docker
อยู่เบื้องหลัง) — ไม่ต้องสมัครบัญชี Supabase cloud หรือต่ออินเทอร์เน็ตเพื่อพัฒนา
เลยก็ได้ ข้อมูลทั้งหมดอยู่ในเครื่องคุณ

## สถาปัตยกรรมโดยสรุป

- **Frontend + Server**: Next.js (Server Components, Server Actions)
- **Database + Auth + Storage**: Supabase รันบนเครื่อง local ผ่าน Docker (ตอน dev)
  และรันบน server ของคุณเองด้วยวิธีเดียวกันตอน deploy จริง (ดูหัวข้อด้านล่าง)
- **Session**: Supabase Auth เก็บ session เป็น HTTP-only cookie ผ่าน `@supabase/ssr`
- **สิทธิ์แอดมิน**: ตรวจสอบจากตาราง `admin_users` ทุกครั้งที่ request เข้าหา
  `/admin/*` ทั้งใน Middleware และใน Server Action

## ข้อกำหนดเบื้องต้น

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (หรือ Docker
  Engine บน Linux) — ต้องเปิดไว้ก่อนรัน Supabase ทุกครั้ง
- Node.js 20+

## เริ่มต้นใช้งาน (Local Development)

### 1. ติดตั้ง dependencies

```bash
npm install
```

คำสั่งนี้จะติดตั้ง Supabase CLI มาด้วย (อยู่ใน `devDependencies` แล้ว) ไม่ต้อง
ติดตั้งแยก

### 2. เปิด Docker แล้วสตาร์ท Supabase local stack

```bash
npm run db:start
```

ครั้งแรกจะใช้เวลาสักพัก (โหลด Docker images) ครั้งต่อไปจะเร็วมาก (~10 วินาที)
เมื่อเสร็จจะเห็น URL และ key ต่างๆ พิมพ์ออกมาในเทอร์มินัล — ค่าพวกนี้เป็นค่า
default คงที่ของ Supabase CLI (เหมือนกันทุกเครื่องที่ยังไม่เปลี่ยน config) ตรงกับ
ค่าที่ใส่ไว้ใน `.env.example` อยู่แล้ว จึงไม่ต้องคัดลอกอะไรเพิ่ม

หากต้องการดูค่าซ้ำอีกครั้ง: `npm run db:status`

### 3. ตั้งค่า environment variables

```bash
cp .env.example .env.local
```

ค่า default ใน `.env.example` ชี้ไปที่ local stack อยู่แล้ว (`http://127.0.0.1:54321`)
ไม่ต้องแก้อะไรสำหรับการพัฒนาในเครื่อง

### 4. ใส่ schema และข้อมูลตัวอย่างลงฐานข้อมูล

```bash
npm run db:reset
```

คำสั่งนี้จะรัน migration ทั้งหมดใน `supabase/migrations/` (สร้างตาราง, RLS
policies, Storage buckets, ข้อมูล genres เริ่มต้น) แล้วตามด้วย `supabase/seed.sql`
(มังฮวาตัวอย่าง 3 เรื่องพร้อมตอนทดสอบ) ทำให้หน้าแรกไม่ว่างตั้งแต่รันครั้งแรก

### 5. รันเว็บ

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

เปิด **Supabase Studio** (GUI จัดการฐานข้อมูล รันในเครื่องเช่นกัน) ที่
[http://127.0.0.1:54323](http://127.0.0.1:54323) เพื่อดู/แก้ข้อมูลโดยตรง

### 6. สร้างบัญชีแอดมินคนแรก

ไม่มีหน้าสมัครแอดมินโดยตั้งใจ (ป้องกันคนแอบสมัครเป็นแอดมินเอง) ขั้นตอน:

1. สมัครสมาชิกผ่านหน้าเว็บปกติที่ `/register` ด้วยอีเมลที่จะใช้เป็นแอดมิน
   (อีเมลปลอมก็ได้ตอน dev เพราะปิด email confirmation ไว้แล้วใน `supabase/config.toml`)
2. เปิด Supabase Studio ที่ http://127.0.0.1:54323 → Authentication → Users
   → คัดลอก UUID ของบัญชีนั้น
3. ไปที่แท็บ SQL Editor ใน Studio แล้วรัน:
   ```sql
   insert into admin_users (id, role) values ('<UUID ที่คัดลอกมา>', 'admin');
   ```
4. ล็อกอินที่ `/admin/login` ด้วยอีเมล/รหัสผ่านเดียวกับที่สมัครไว้ — เข้าได้ทันที

### คำสั่งที่ใช้บ่อย

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `npm run db:start` | เปิด local Supabase stack (ต้องเปิด Docker ก่อน) |
| `npm run db:stop` | ปิด stack (ข้อมูลยังอยู่ ไม่หาย) |
| `npm run db:reset` | ลบข้อมูลทั้งหมด แล้วรัน migrations + seed ใหม่ตั้งแต่ต้น |
| `npm run db:status` | แสดง URL/key ของ local stack อีกครั้ง |

## โครงสร้างโปรเจกต์

```
src/
├── app/                          # Next.js App Router — แต่ละโฟลเดอร์ = 1 route
│   ├── page.tsx                  # หน้าแรก
│   ├── search/                   # ผลการค้นหา
│   ├── manhwa/[slug]/            # หน้ารายละเอียดเรื่อง + รายชื่อตอน
│   │   └── chapter/[chapterNumber]/  # หน้าอ่าน (viewer)
│   ├── login/  register/         # สมัครสมาชิก / เข้าสู่ระบบ
│   ├── dashboard/                # แดชบอร์ดผู้ใช้ + ประวัติการอ่าน (ต้องล็อกอิน)
│   ├── bookmarks/                # เรื่องโปรด (ต้องล็อกอิน)
│   └── admin/
│       ├── login/                # เข้าสู่ระบบแอดมิน (ใช้ Supabase Auth เดียวกัน)
│       └── (dashboard)/          # ป้องกันด้วย middleware + requireAdmin()
├── components/                   # UI components
├── lib/
│   ├── supabase/                 # client.ts / server.ts / middleware.ts
│   ├── auth.ts                   # getCurrentUser / requireUser / requireAdmin
│   ├── queries/manhwa.ts         # Query functions อ่านข้อมูลจาก Supabase
│   └── actions/                  # Server Actions (เขียนข้อมูล) แยกตามโดเมน
├── middleware.ts                 # รีเฟรช session + กัน /admin/* จากผู้ไม่มีสิทธิ์
└── types/                        # index.ts (domain types) + database.ts (DB types)

supabase/
├── config.toml                   # ตั้งค่า local stack (port, auth, storage limits)
├── migrations/                   # Schema จริงที่ใช้รัน (แหล่งความจริงเดียว)
│   └── 20260101000000_initial_schema.sql
└── seed.sql                      # ข้อมูลตัวอย่างสำหรับ dev เท่านั้น

docs/
└── database-schema.sql           # สำเนาอ่านอย่างเดียวของ schema (ดูคอมเมนต์บนสุดของไฟล์)
```

## ฟีเจอร์

- **หน้าแรก**: รายการมังฮวาทั้งหมดจากฐานข้อมูลจริง, ค้นหา/กรองตามประเภท+สถานะ,
  แถบ "อ่านต่อจากที่ค้างไว้" (เฉพาะผู้ที่ล็อกอิน)
- **อ่านได้โดยไม่ต้องล็อกอิน**: ทุกหน้าอ่านเปิดสาธารณะ, การล็อกอินจำเป็นเฉพาะ
  ตอนบันทึกประวัติ/bookmark
- **หน้าอ่าน (Viewer)**: เลื่อนอ่านแนวตั้งต่อเนื่อง, lazy-load รูปภาพ, ปุ่ม/dropdown
  สลับตอน, บันทึกประวัติการอ่านอัตโนมัติเมื่อเปิดตอน (ถ้าล็อกอินอยู่)
- **ระบบสมาชิก**: สมัคร/ล็อกอินจริงผ่าน Supabase Auth, แดชบอร์ดประวัติการอ่าน
- **Admin Panel**: ป้องกันด้วย middleware ที่เช็ค `admin_users` จริงทุก request,
  CRUD มังฮวาเต็มรูปแบบพร้อมอัปโหลดรูปปกขึ้น Supabase Storage, อัปโหลดตอนแบบ
  bulk multi-image พร้อม natural sort + ลากวางจัดเรียง + toggle Draft/Publish

## Deploy ตอนทำจริง: รัน Supabase บน Server เอง (ไม่ใช้ Supabase cloud)

เนื่องจากเป้าหมายคือไม่พึ่ง Supabase cloud แม้ตอน deploy จริง วิธีที่ตรงไปตรงมา
ที่สุดคือรัน **Supabase self-hosted (Docker Compose)** บน server ของคุณเอง —
เป็น stack เดียวกันกับที่ใช้ใน local dev เป๊ะๆ (Postgres + Auth + Storage) แค่รัน
อยู่บนเครื่องอื่นแทน ทำให้พฤติกรรม dev กับ production เหมือนกันทุกอย่าง

ขั้นตอนคร่าวๆ (รายละเอียดเต็มอยู่ที่
[Supabase Self-Hosting Docs](https://supabase.com/docs/guides/self-hosting/docker)):

1. บน server: clone `supabase/supabase` repo → ใช้โฟลเดอร์ `docker/` ที่มากับ repo
2. รัน script generate secrets ของ Supabase (`generate-keys` หรือเทียบเท่า) —
   **ห้ามใช้ค่า placeholder จาก `.env.example` ของ Supabase repo บน production
   เด็ดขาด** ต้องสุ่มใหม่ทุกค่า (`POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`,
   `SERVICE_ROLE_KEY`)
3. `docker compose up -d` เพื่อสตาร์ท stack เต็มรูปแบบบน server
4. รัน schema เดียวกับที่ใช้ใน local: เอาเนื้อหาจาก
   `supabase/migrations/20260101000000_initial_schema.sql` ไปรันผ่าน SQL Editor
   ใน Studio ของ server นั้น (เข้าผ่าน URL ของ server เอง ไม่ใช่ 127.0.0.1)
5. อัปเดต `.env.local` (หรือ environment variables ของที่ deploy แอป Next.js)
   ให้ชี้ไปที่ URL และ key ใหม่ของ server นั้น — **อย่าใช้ key ของ local dev ใน
   production เด็ดขาด** เพราะเป็นค่า default ที่รู้กันสาธารณะ
5.1. แก้ `images.remotePatterns` ใน `next.config.js` เพิ่ม hostname ของ
   Supabase Storage บน server นั้น (เช่น `storage.yourdomain.com` หรือ
   IP/domain ที่ตั้งไว้) มิฉะนั้นรูปภาพจะขึ้น error "hostname is not
   configured" แบบเดียวกับตอน dev ถ้าลืมเพิ่ม `127.0.0.1:54321`
6. ตั้ง reverse proxy (Nginx/Traefik) หน้า Supabase Kong gateway เพื่อทำ SSL/TLS
   และตั้ง subdomain ที่ต้องการ (เช่น `supabase.yourdomain.com`)
7. Build แอป Next.js (`npm run build`) แล้วรันด้วย `npm run start`, หรือ deploy
   ผ่าน reverse proxy เดียวกันบน server นั้นเลยก็ได้ — ไม่จำเป็นต้องใช้ Vercel
   ถ้าต้องการให้ทุกอย่างอยู่บนเครื่องเดียวกันทั้งหมด

ค่าใช้จ่ายคือค่า server เท่านั้น (เช่น VPS ราคาประหยัด) ไม่มีค่า subscription
ของ Supabase หรือ Vercel เลย แลกกับการที่ต้องดูแล server, backup, security
patch เองทั้งหมด

## หมายเหตุด้านความปลอดภัย

- รหัสผ่านทั้งหมดถูก hash และจัดการโดย Supabase Auth — โค้ดแอปไม่เคยเห็นหรือ
  เก็บรหัสผ่านแบบ plaintext เลย
- การตรวจสอบสิทธิ์แอดมินทำที่ฝั่ง server เสมอ (middleware + `requireAdmin()`)
- Row Level Security (RLS) เปิดใช้งานทุกตารางที่เก็บข้อมูลผู้ใช้
- `SUPABASE_SECRET_KEY` (service role) ต้องไม่อยู่ใน environment variable ที่
  ขึ้นต้นด้วย `NEXT_PUBLIC_` เด็ดขาด — ค่า default ใน `.env.example` ใช้ได้
  เฉพาะตอน dev ในเครื่องเท่านั้น เมื่อ deploy จริงต้องสร้างค่าใหม่ตามขั้นตอนด้านบน
- จำกัดขนาดไฟล์อัปโหลด (รูปปก 5MB, รูปหน้าตอน 10MB ต่อไฟล์) ทั้งฝั่ง client และ
  server action

## สิ่งที่ควรทำเพิ่มก่อนขึ้น production จริงจัง

- เปิด `enable_confirmations = true` ใน auth config ของ server (ปิดไว้เฉพาะ
  local dev เพื่อความสะดวก)
- ตั้ง rate limiting บนหน้า login
- เพิ่ม image resizing/compression ก่อนอัปโหลดเพื่อประหยัด Storage และ bandwidth
- ตั้งระบบ backup ฐานข้อมูลอัตโนมัติบน server (Supabase cloud มีให้ในตัว แต่
  self-hosted ต้องตั้งเอง เช่น `pg_dump` ตามตารางเวลา)
- พิจารณาใช้ Next.js `revalidate`/ISR สำหรับหน้าแรกและหน้ารายละเอียดเรื่องเพื่อ
  ลด query เมื่อ traffic สูงขึ้น
