# 🚀 AgriConnect v2.0 - Quick Start Guide

เริ่มต้นใช้งานภายใน **10 นาที**!

---

## ✅ Checklist

- [ ] มี Supabase account
- [ ] Node.js 18+ ติดตั้งแล้ว
- [ ] Git ติดตั้งแล้ว

---

## 📝 ขั้นตอนการติดตั้ง

### **1. Setup Supabase (5 นาที)**

#### 1.1 สร้าง Supabase Project

1. เข้า [https://supabase.com](https://supabase.com)
2. คลิก "New Project"
3. กรอก:
   - Project name: `agriconnect-v2`
   - Database password: (จดไว้)
   - Region: `Southeast Asia (Singapore)`
4. คลิก "Create new project" (รอ ~2 นาที)

#### 1.2 รัน Migration

1. เมื่อ project สร้างเสร็จ → ไปที่ **SQL Editor**
2. คลิก "New query"
3. เปิดไฟล์ `scripts/agriconnect-v2-migration.sql` → คัดลอกทั้งหมด
4. Paste ใน SQL Editor → คลิก "Run"
5. ✅ ควรเห็น: "AgriConnect v2.0 Migration Completed Successfully!"

6. สร้าง query ใหม่อีกครั้ง
7. เปิดไฟล์ `scripts/agriconnect-v2-rls-policies.sql` → คัดลอกทั้งหมด
8. Paste → คลิก "Run"
9. ✅ ควรเห็น: "RLS Policies Created Successfully!"

10. สร้าง query ใหม่อีกครั้ง (สำหรับ helper function)
11. Paste code นี้:

```sql
CREATE OR REPLACE FUNCTION increment_proposal_count(job_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE job_postings
    SET proposal_count = COALESCE(proposal_count, 0) + 1
    WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;
```

12. คลิก "Run"

#### 1.3 ดึง API Keys

1. ไปที่ **Settings** → **API**
2. คัดลอก:
   - `Project URL`
   - `anon public` key
   - `service_role` key (แสดงเมื่อคลิก "Reveal")

---

### **2. Setup Project (2 นาที)**

#### 2.1 Install Dependencies

```bash
cd D:\project\drone-booking-service
npm install
```

#### 2.2 Configure Environment

สร้างไฟล์ `.env.local` ใน root folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**แทนที่ด้วยค่าจาก Supabase ของคุณ!**

---

### **3. Run Application (1 นาที)**

```bash
npm run dev
```

✅ เปิดเบราว์เซอร์: [http://localhost:3000](http://localhost:3000)

---

## 🎯 ทดสอบหน้าจอ

### **Farmer (เกษตรกร)**

```
✅ Dashboard:      http://localhost:3000/farmer/dashboard
✅ โพสต์งาน:       http://localhost:3000/farmer/post-job
✅ งานของฉัน:      http://localhost:3000/farmer/my-jobs
```

### **Provider (ผู้รับจ้าง)**

```
✅ Dashboard:      http://localhost:3000/provider/dashboard
✅ หางาน:          http://localhost:3000/provider/browse-jobs
```

### **Admin**

```
✅ Dashboard:      http://localhost:3000/admin/dashboard
🔐 Login:          http://localhost:3000/admin/login
```

---

## 🧪 ทดสอบ API

### ทดสอบด้วย curl หรือ Postman:

```bash
# 1. ดึงรายการงานทั้งหมด
curl http://localhost:3000/api/jobs?status=open

# 2. สร้างงานใหม่
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_id": "test-user-id",
    "job_type": "พ่นยา",
    "title": "พ่นยานาข้าว 10 ไร่",
    "area_size": 10,
    "budget_min": 1500,
    "budget_max": 2000,
    "province": "นครราชสีมา"
  }'

# 3. ดึงรายการผู้ให้บริการ
curl http://localhost:3000/api/service-providers?verified=true
```

---

## ⚠️ Troubleshooting

### ❌ "Module not found: @/lib/supabase/server"

**แก้:** สร้างไฟล์ที่หายไป (ไฟล์นี้ถูกสร้างแล้วใน lib/supabase/server.ts)

### ❌ "Supabase client error"

**แก้:**
1. ตรวจสอบ `.env.local` มีค่าถูกต้อง
2. Restart dev server: `Ctrl+C` → `npm run dev`

### ❌ "Table does not exist"

**แก้:** รัน migration script อีกครั้งใน Supabase SQL Editor

### ❌ "RLS policy violation"

**แก้:** รัน RLS policies script อีกครั้ง

---

## 📚 เอกสารเพิ่มเติม

- **Full README:** [AGRICONNECT_V2_README.md](./AGRICONNECT_V2_README.md)
- **Database Schema:** ดูใน migration script
- **API Docs:** ดูใน README

---

## 🎉 เสร็จแล้ว!

ตอนนี้คุณมีระบบ AgriConnect v2.0 พร้อมใช้งานแล้ว! 🌾

**Next Steps:**

1. ✅ ทดสอบ User Flow (โพสต์งาน → ส่งข้อเสนอ)
2. ✅ ปรับแต่ง UI/UX
3. ✅ เพิ่ม Authentication (LINE Login)
4. ✅ เพิ่มฟีเจอร์ที่เหลือ (ดูใน README → TODO section)

**Happy Coding!** 🚀
