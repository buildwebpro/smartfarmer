# SmartFarmer v2.0 - Marketplace Platform

**Fastwork สำหรับเกษตรกร** - แพลตฟอร์ม Marketplace ที่เกษตรกรสามารถจ้างผู้เชี่ยวชาญ เช่าเครื่องจักร และจัดการฟาร์มได้อย่างมืออาชีพ

---

## 🎯 ภาพรวมระบบ

### **User Roles (5 บทบาท)**

1. **เกษตรกร (Farmer)** - โพสต์งาน, เช่าเครื่องจักร, จัดการปฏิทิน
2. **ผู้รับจ้าง (Service Provider)** - หางาน, ส่งข้อเสนอ, รับรีวิว
3. **เจ้าของเครื่องจักร (Equipment Owner)** - ให้เช่าเครื่องจักร
4. **แอดมิน (Admin)** - จัดการระบบ, ดูรายงาน
5. **เจ้าหน้าที่ส่งเสริม (Extension Officer)** - ออกใบรับรอง, แนะนำบริการ

### **Core Features**

- ✅ **Job Marketplace** - เกษตรกรโพสต์งาน, ผู้รับจ้างส่งข้อเสนอแข่งขัน
- ✅ **Equipment Rental** - เช่าโดรน, รถไถ, รถเกี่ยว, ปั๊มน้ำ
- ✅ **Farm Calendar** - ปฏิทินเพาะปลูกอัตโนมัติตามพืช
- ✅ **Review & Rating** - รีวิว 2 ทาง (เกษตรกร ↔ ผู้รับจ้าง)
- ✅ **In-app Chat** - แชทระหว่างผู้ใช้
- 🔄 **Gov API Integration** - ข้อมูลสภาพอากาศ, ราคาพืช
- 🔄 **Payment Gateway** - PromptPay, Cards
- 🔄 **LINE Integration** - LIFF + Chatbot + Notify

---

## 📁 โครงสร้างโปรเจค

```
drone-booking-service/
├── app/
│   ├── farmer/           # หน้าจอเกษตรกร
│   │   ├── dashboard/
│   │   ├── post-job/
│   │   ├── my-jobs/
│   │   ├── equipment/
│   │   ├── calendar/
│   │   ├── messages/
│   │   └── profile/
│   ├── provider/         # หน้าจอผู้รับจ้าง
│   │   ├── dashboard/
│   │   ├── browse-jobs/
│   │   ├── my-proposals/
│   │   ├── earnings/
│   │   └── profile/
│   ├── owner/            # หน้าจอเจ้าของเครื่องจักร
│   │   ├── dashboard/
│   │   ├── equipment/
│   │   └── bookings/
│   ├── admin/            # Dashboard แอดมิน
│   └── api/              # API Routes
│       ├── jobs/
│       ├── proposals/
│       ├── service-providers/
│       └── ...
├── scripts/
│   ├── agriconnect-v2-migration.sql      # Migration script
│   └── agriconnect-v2-rls-policies.sql   # RLS policies
└── components/           # Shared components
```

---

## 🚀 การติดตั้งและรัน

### **Prerequisites**

- Node.js 18+
- npm หรือ yarn
- Supabase account
- Git

### **Step 1: Clone Repository**

```bash
cd D:\project\drone-booking-service
git pull  # หรือ clone ถ้ายังไม่มี
```

### **Step 2: Install Dependencies**

```bash
npm install
```

### **Step 3: Setup Supabase**

#### 3.1 Create Supabase Project

1. ไปที่ [https://supabase.com](https://supabase.com)
2. สร้าง Project ใหม่ หรือใช้ project ที่มีอยู่
3. ไปที่ **Settings** → **API** → คัดลอก:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public key` (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role key` (SUPABASE_SERVICE_ROLE_KEY)

#### 3.2 Configure Environment Variables

สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 3.3 Run Migration Scripts

1. เปิด **Supabase Dashboard** → **SQL Editor**
2. รันไฟล์ตามลำดับ:

**ขั้นที่ 1: รัน Migration**
```sql
-- คัดลอกและรันทั้งหมดจากไฟล์
scripts/agriconnect-v2-migration.sql
```

**ขั้นที่ 2: รัน RLS Policies**
```sql
-- คัดลอกและรันทั้งหมดจากไฟล์
scripts/agriconnect-v2-rls-policies.sql
```

**ขั้นที่ 3: เพิ่ม Helper Function (สำหรับ proposal count)**
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

#### 3.4 Verify Migration

ตรวจสอบว่า tables ถูกสร้างครบ:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

ควรเห็น tables เหล่านี้:
- ✅ service_providers
- ✅ farm_profiles
- ✅ job_postings
- ✅ proposals
- ✅ reviews
- ✅ farm_calendar
- ✅ crop_schedules
- ✅ messages
- ✅ gov_api_cache

### **Step 4: Run Development Server**

```bash
npm run dev
```

เปิดเบราว์เซอร์: [http://localhost:3000](http://localhost:3000)

---

## 📱 หน้าจอที่พร้อมใช้งาน

### **เกษตรกร (Farmer)**

1. `/farmer/dashboard` - Dashboard หลัก (สถิติ + ปฏิทิน + แจ้งเตือน)
2. `/farmer/post-job` - โพสต์งานหาผู้รับจ้าง
3. `/farmer/my-jobs` - งานที่โพสต์ + ดูข้อเสนอ
4. `/farmer/equipment` - เช่าเครื่องจักร (ใช้จากระบบเดิม)
5. `/farmer/calendar` - ปฏิทินเพาะปลูก (TODO)
6. `/farmer/messages` - แชท (TODO)
7. `/farmer/profile` - โปรไฟล์ (TODO)

### **ผู้รับจ้าง (Provider)**

1. `/provider/dashboard` - Dashboard (สถิติ + งานแนะนำ)
2. `/provider/browse-jobs` - ค้นหางาน + ฟิลเตอร์
3. `/provider/my-proposals` - ข้อเสนอของฉัน (TODO)
4. `/provider/earnings` - รายได้ (TODO)
5. `/provider/profile` - โปรไฟล์ + Portfolio (TODO)

### **แอดมิน (Admin)**

- `/admin/dashboard` - ใช้จากระบบเดิม (จะขยายเพิ่ม)

---

## 🛠️ API Endpoints

### **Jobs API**

```typescript
// GET /api/jobs - ดึงรายการงานทั้งหมด
GET /api/jobs?status=open&job_type=พ่นยา&province=นครราชสีมา

// POST /api/jobs - สร้างงานใหม่
POST /api/jobs
Body: {
  farmer_id, job_type, title, description,
  area_size, budget_min, budget_max, ...
}

// GET /api/jobs/[id] - ดูรายละเอียดงาน + ข้อเสนอ
GET /api/jobs/abc123

// DELETE /api/jobs/[id] - ยกเลิกงาน
DELETE /api/jobs/abc123
```

### **Proposals API**

```typescript
// GET /api/proposals - ดึงข้อเสนอ
GET /api/proposals?provider_id=xxx
GET /api/proposals?job_id=xxx

// POST /api/proposals - ส่งข้อเสนอใหม่
POST /api/proposals
Body: {
  job_id, provider_id, price,
  estimated_duration, description
}

// PATCH /api/proposals - อนุมัติ/ปฏิเสธข้อเสนอ
PATCH /api/proposals
Body: { id, status: 'accepted' | 'rejected' }
```

### **Service Providers API**

```typescript
// GET /api/service-providers - ดึงรายการผู้ให้บริการ
GET /api/service-providers?service_type=พ่นยา&verified=true

// POST /api/service-providers - สร้างโปรไฟล์
POST /api/service-providers
Body: {
  user_id, service_types[], hourly_rate,
  certifications[], bio, ...
}
```

---

## 🗄️ Database Schema

### **หลักๆ มี 10 Tables ใหม่:**

1. **service_providers** - โปรไฟล์ผู้ให้บริการ
2. **farm_profiles** - โปรไฟล์ฟาร์ม
3. **job_postings** - งานที่เกษตรกรโพสต์
4. **proposals** - ข้อเสนอจากผู้รับจ้าง
5. **reviews** - รีวิว 2-way
6. **farm_calendar** - ปฏิทินกิจกรรม
7. **crop_schedules** - Template ปฏิทินตามพืช (มี seed data: ข้าว, อ้อย, ข้าวโพด)
8. **messages** - แชทในแอป
9. **gov_api_cache** - Cache ข้อมูล Gov APIs
10. **customers** (ขยาย) - เพิ่ม column `role`, `province`, `verified`

---

## 🔐 Security (RLS Policies)

ทุก table มี Row Level Security เปิดใช้งาน:

- ✅ Users เห็นเฉพาะข้อมูลของตัวเอง
- ✅ งานที่ "open" เห็นได้ทุกคน
- ✅ Admins เห็นข้อมูลทั้งหมด
- ✅ ข้อมูล public (providers, reviews) เห็นได้ทุกคน

---

## 📊 Seed Data

**Crop Schedules** (มีอยู่แล้วหลัง migration):

- ✅ ข้าว - 7 กิจกรรม (ปลูก → เกี่ยว 120 วัน)
- ✅ อ้อย - 6 กิจกรรม (ปลูก → เกี่ยว 365 วัน)
- ✅ ข้าวโพด - 5 กิจกรรม (ปลูก → เกี่ยว 75 วัน)

---

## 🧪 การทดสอบ

### **Test User Flows**

#### 1. เกษตรกรโพสต์งาน

```
1. เข้า /farmer/dashboard
2. คลิก "โพสต์งาน"
3. กรอกฟอร์ม:
   - ประเภทงาน: พ่นยา
   - พื้นที่: 10 ไร่
   - งบ: 1,500-2,000 บาท
4. Submit → ดูใน /farmer/my-jobs
```

#### 2. ผู้รับจ้างส่งข้อเสนอ

```
1. เข้า /provider/dashboard
2. เห็นงานแนะนำ
3. คลิก "ส่งข้อเสนอ"
4. กรอกราคา + รายละเอียด
5. Submit → ดูใน /provider/my-proposals
```

#### 3. เกษตรกรเลือกข้อเสนอ

```
1. เข้า /farmer/my-jobs
2. เห็น "มีข้อเสนอ 2 รายการ"
3. คลิก "ดูข้อเสนอ"
4. เปรียบเทียบ → เลือก
5. ยืนยัน → สถานะเปลี่ยนเป็น "กำลังดำเนินการ"
```

---

## 🎨 UI/UX Design

### **Design System**

- **สีหลัก:**
  - เกษตรกร: Green (#10B981)
  - ผู้รับจ้าง: Blue (#2563EB)
  - แอดมิน: Emerald (#059669)

- **Components:**
  - shadcn/ui components
  - Lucide React icons
  - Tailwind CSS

- **Mobile-First:**
  - Responsive design
  - ปุ่มใหญ่ (min 48px)
  - ใช้งานง่ายสำหรับผู้สูงอายุ

---

## 🚧 TODO (Features ที่ยังไม่เสร็จ)

### **Phase 1 (Critical)**
- [ ] Authentication (LINE Login + OTP)
- [ ] Upload รูปภาพ (Supabase Storage)
- [ ] หน้า Proposals detail (เกษตรกรดูข้อเสนอ)
- [ ] หน้า Send Proposal (ผู้รับจ้างส่งข้อเสนอ)
- [ ] Profile pages (Farmer + Provider)

### **Phase 2 (Important)**
- [ ] Farm Calendar (auto-generate)
- [ ] In-app Chat (Supabase Realtime)
- [ ] Review & Rating system
- [ ] Equipment Rental integration

### **Phase 3 (Nice to have)**
- [ ] Gov API (Weather, Crop prices)
- [ ] Payment Gateway (PromptPay)
- [ ] LINE Chatbot
- [ ] AI Crop Disease Detection
- [ ] Push Notifications

---

## 📞 Support

- **Documentation:** ดูใน `/docs` (TODO)
- **API Docs:** ดูใน `/api-docs` (TODO)
- **Issues:** [GitHub Issues](#)

---

## 📝 License

Private - SmartFarmer v2.0

---

## 🎉 เริ่มต้นใช้งาน

```bash
# 1. Install dependencies
npm install

# 2. Run migration on Supabase
# (คัดลอกจากไฟล์ scripts/*.sql ไปรันใน SQL Editor)

# 3. Configure .env.local
# (กรอก Supabase credentials)

# 4. Start development server
npm run dev

# 5. เปิดเบราว์เซอร์
http://localhost:3000/farmer/dashboard
http://localhost:3000/provider/dashboard
```

**ยินดีต้อนรับสู่ SmartFarmer v2.0!** 🌾🚁
