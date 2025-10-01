# ระบบจัดการเครื่องจักรให้เช่า (Equipment Rental System)

## 📋 สรุปฟีเจอร์

ระบบนี้เพิ่มความสามารถในการจัดการและให้เช่าเครื่องจักรการเกษตรต่างๆ นอกเหนือจากบริการพ่นยาด้วยโดรน

### ✨ Features ใหม่

1. **จัดการเครื่องจักร (Equipment Management)**
   - เพิ่ม/แก้ไข/ลบเครื่องจักร
   - แบ่งประเภทเครื่องจักร (โดรน, รถไถ, รถเกี่ยวข้าว, ปั๊มน้ำ, เครื่องตัดหญ้า)
   - กำหนดอัตราค่าเช่า (รายวัน/รายชั่วโมง)
   - ติดตามสถานะ (พร้อมใช้งาน, กำลังใช้งาน, บำรุงรักษา, ซ่อมแซม)
   - กำหนดเงินมัดจำ
   - แสดง Stats และการค้นหา

2. **ระบบจองเช่าเครื่องจักร (Rental Booking)**
   - เลือกเครื่องจักรตามประเภท
   - กำหนดวันเริ่ม-สิ้นสุดการเช่า
   - คำนวณค่าเช่าอัตโนมัติตามจำนวนวัน
   - แสดง QR Code สำหรับชำระเงินมัดจำ
   - เข้าถึงผ่าน LINE LIFF

3. **อัปเดตระบบ Booking**
   - รองรับ 2 ประเภท: บริการพ่นยา (service) และเช่าเครื่องจักร (rental)
   - บันทึกวันที่เช่าและระยะเวลา
   - แยกเงินมัดจำสำหรับเครื่องจักร

## 📁 ไฟล์ที่เพิ่ม/แก้ไข

### Database Schema
- `scripts/add-equipment-system.sql` - SQL สำหรับสร้างตารางใหม่
- `scripts/apply-equipment-schema.js` - Script รัน migration (optional)

### API Routes
- `app/api/equipment/route.ts` - CRUD เครื่องจักร
- `app/api/equipment/categories/route.ts` - CRUD ประเภทเครื่องจักร

### Admin UI
- `app/admin/equipment/page.tsx` - หน้าจัดการเครื่องจักร (ใหม่)
- `components/modern-navigation.tsx` - เพิ่มเมนู "จัดการเครื่องจักร"

### LIFF Pages
- `app/line/liff/rental/page.tsx` - หน้าจองเช่าเครื่องจักรผ่าน LINE (ใหม่)
- `app/line/liff/booking/page.tsx` - หน้าจองบริการพ่นยา (เดิม)

## 🗄️ Database Schema

### ตารางใหม่

1. **equipment_categories** - ประเภทเครื่องจักร
   ```sql
   - id (UUID)
   - name (VARCHAR) - ชื่อประเภท
   - description (TEXT)
   - icon (VARCHAR) - lucide icon name
   - is_active (BOOLEAN)
   - display_order (INTEGER)
   ```

2. **equipment** - เครื่องจักรทั้งหมด
   ```sql
   - id (UUID)
   - category_id (UUID) FK -> equipment_categories
   - name (VARCHAR) - ชื่อเครื่องจักร
   - model (VARCHAR)
   - brand (VARCHAR)
   - description (TEXT)
   - specifications (JSONB) - ข้อมูล spec
   - status (VARCHAR) - available|working|maintenance|repair|retired
   - assigned_operator_id (UUID) FK -> operators
   - rental_price_per_day (DECIMAL)
   - rental_price_per_hour (DECIMAL)
   - deposit_amount (DECIMAL)
   - condition (VARCHAR)
   - operating_hours (DECIMAL)
   - last_maintenance (DATE)
   - next_maintenance (DATE)
   - current_location (VARCHAR)
   - image_url (VARCHAR)
   - images (JSONB)
   ```

3. **equipment_rental_rates** - อัตราค่าเช่าแบบยืดหยุ่น
   ```sql
   - id (UUID)
   - equipment_id (UUID) FK -> equipment
   - rate_type (VARCHAR) - hourly|daily|weekly|monthly
   - price (DECIMAL)
   - minimum_duration (INTEGER)
   ```

4. **equipment_maintenance_log** - บันทึกการบำรุงรักษา
   ```sql
   - id (UUID)
   - equipment_id (UUID) FK -> equipment
   - maintenance_type (VARCHAR)
   - description (TEXT)
   - cost (DECIMAL)
   - performed_by (VARCHAR)
   - performed_at (TIMESTAMP)
   - notes (TEXT)
   ```

### ตารางที่แก้ไข

1. **bookings** - เพิ่มคอลัมน์สำหรับ rental
   ```sql
   - equipment_id (UUID) FK -> equipment
   - booking_type (VARCHAR) - service|rental
   - rental_start_date (DATE)
   - rental_end_date (DATE)
   - rental_duration_days (INTEGER)
   ```

2. **pilots → operators** - Rename table
   - เพิ่ม `operator_type` (VARCHAR) - pilot|operator|both

## 🚀 การติดตั้ง

### ขั้นตอนที่ 1: รัน Database Migration

เปิด Supabase Dashboard → SQL Editor และรันไฟล์:
```
scripts/add-equipment-system.sql
```

หรือใช้ Supabase CLI:
```bash
supabase db push --file ./scripts/add-equipment-system.sql
```

### ขั้นตอนที่ 2: ตรวจสอบตาราง

ไปที่ Table Editor ใน Supabase Dashboard ตรวจสอบว่ามีตารางใหม่:
- ✅ equipment_categories (มี 6 categories)
- ✅ equipment (มีข้อมูลตัวอย่าง)
- ✅ equipment_rental_rates
- ✅ equipment_maintenance_log
- ✅ operators (เดิมชื่อ pilots)

### ขั้นตอนที่ 3: ทดสอบระบบ

1. **Admin Panel**
   - เข้า: http://localhost:3000/admin
   - คลิก "จัดการเครื่องจักร" ในเมนู
   - ลองเพิ่มเครื่องจักรใหม่

2. **LINE LIFF (Rental)**
   - เข้า: http://localhost:3000/line/liff/rental
   - เลือกเครื่องจักรที่ต้องการเช่า
   - กำหนดวันเริ่ม-สิ้นสุด
   - ยืนยันการจอง

3. **LINE LIFF (Service)**
   - เข้า: http://localhost:3000/line/liff/booking
   - จองบริการพ่นยาด้วยโดรน (เดิม)

## 📊 ข้อมูลตัวอย่าง

ระบบมาพร้อมข้อมูลตัวอย่าง:

### ประเภทเครื่องจักร (6 ประเภท)
1. โดรนพ่นยา
2. รถไถ
3. รถเกี่ยวข้าว
4. เครื่องสูบน้ำ
5. เครื่องปลูก
6. เครื่องตัดหญ้า

### เครื่องจักรตัวอย่าง (8 รายการ)
- รถไถ Kubota L4508 (฿1,500/วัน)
- รถไถ Massey Ferguson 265 (฿1,200/วัน)
- รถเกี่ยว Kubota DC70 (฿2,500/วัน)
- รถเกี่ยว Yanmar YH880 (฿1,000/วัน)
- ปั๊มน้ำ Honda WB30 (฿400/วัน)
- ปั๊มน้ำ Mitsubishi GB180 (฿450/วัน)
- เครื่องตัดหญ้า Stihl FS 120 (฿200/วัน)
- เครื่องตัดหญ้า Makita DUR191 (฿150/วัน)

## 🔧 การใช้งาน API

### GET /api/equipment
ดึงรายการเครื่องจักร
```javascript
// ทั้งหมด
GET /api/equipment

// กรองตามประเภท
GET /api/equipment?category={category_id}

// กรองตามสถานะ
GET /api/equipment?status=available
```

### POST /api/equipment
เพิ่มเครื่องจักรใหม่
```javascript
POST /api/equipment
{
  "category_id": "uuid",
  "name": "รถไถ Kubota",
  "model": "L4508",
  "brand": "Kubota",
  "rental_price_per_day": 1500,
  "rental_price_per_hour": 300,
  "deposit_amount": 3000,
  "current_location": "ฐานหลัก"
}
```

### PUT /api/equipment
อัปเดตเครื่องจักร
```javascript
PUT /api/equipment
{
  "id": "uuid",
  "status": "maintenance",
  "current_location": "ศูนย์บำรุงรักษา"
}
```

### DELETE /api/equipment?id={id}
ลบเครื่องจักร (soft delete)

### GET /api/equipment/categories
ดึงรายการประเภทเครื่องจักร

### POST /api/equipment/categories
เพิ่มประเภทใหม่

## 📱 LINE LIFF URLs

### จองบริการพ่นยา (Service)
```
/line/liff/booking
```

### จองเช่าเครื่องจักร (Rental) - ใหม่!
```
/line/liff/rental
```

### ดูรายการจอง
```
/line/liff/my-bookings
```

## 🔐 Admin Features

### หน้าจัดการเครื่องจักร (/admin/equipment)

**Features:**
- ✅ แสดง Statistics (ทั้งหมด, พร้อมใช้งาน, กำลังใช้งาน, บำรุงรักษา)
- ✅ ค้นหาเครื่องจักร
- ✅ กรองตามประเภท
- ✅ เพิ่มเครื่องจักรใหม่
- ✅ แก้ไขเครื่องจักร
- ✅ ลบเครื่องจักร
- ✅ แสดงข้อมูล: ชื่อ, ประเภท, รุ่น, สถานะ, ค่าเช่า, มัดจำ, สถานที่

**Form Fields:**
- ประเภท (dropdown)
- สถานะ (dropdown)
- ชื่อเครื่องจักร
- รุ่น
- ยี่ห้อ
- รายละเอียด
- ค่าเช่า/วัน (บาท)
- ค่าเช่า/ชั่วโมง (บาท)
- เงินมัดจำ (บาท)
- สถานที่

## 🎨 UI Components ที่ใช้

- Card, CardContent, CardHeader, CardTitle
- Table, TableBody, TableCell, TableHead, TableHeader, TableRow
- Dialog, DialogContent, DialogHeader, DialogTitle
- Button, Input, Label, Select, Textarea
- Badge (สำหรับแสดงสถานะ)
- Calendar (สำหรับเลือกวันที่)
- Icons จาก lucide-react (Truck, Calendar, CreditCard, etc.)

## 🚧 Features ที่จะพัฒนาต่อ (Optional)

1. **Upload รูปภาพเครื่องจักร**
   - ใช้ Supabase Storage
   - แสดงรูปในรายการและหน้ารายละเอียด

2. **ระบบบำรุงรักษา**
   - บันทึกประวัติการบำรุงรักษา
   - แจ้งเตือนถึงกำหนดบำรุงรักษา
   - Dashboard แสดงเครื่องจักรที่ต้องบำรุงรักษา

3. **Dashboard Analytics**
   - สถิติการเช่าเครื่องจักร
   - รายได้จากการเช่า
   - เครื่องจักรที่ได้รับความนิยม
   - กราฟแสดงการใช้งาน

4. **QR Code สำหรับเครื่องจักร**
   - สแกน QR ดูรายละเอียดเครื่องจักร
   - ประวัติการใช้งาน
   - คู่มือการใช้งาน

5. **ระบบจัดตารางการเช่า**
   - Calendar view แสดงเครื่องจักรที่ถูกจอง
   - ป้องกันการจองซ้ำซ้อน
   - แจ้งเตือนก่อนวันคืนเครื่อง

6. **ระบบรีวิวและคะแนน**
   - ลูกค้าให้คะแนนเครื่องจักรหลังเช่า
   - แสดงคะแนนเฉลี่ยในรายการ

7. **ระบบแจ้งเตือนอัตโนมัติ**
   - แจ้งเตือนเมื่อมีการจอง (LINE Notify)
   - แจ้งเตือนก่อนวันรับเครื่อง
   - แจ้งเตือนก่อนวันคืนเครื่อง

## ⚠️ หมายเหตุสำคัญ

1. **ต้องรัน SQL Migration ก่อนใช้งาน**
   - ไฟล์: `scripts/add-equipment-system.sql`
   - รันผ่าน Supabase Dashboard

2. **ตรวจสอบ Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Row Level Security (RLS)**
   - ต้องตั้งค่า RLS policies สำหรับตารางใหม่
   - อนุญาตให้ public อ่านได้ (equipment, equipment_categories)
   - อนุญาตให้ authenticated users เท่านั้นเขียนได้

4. **Operators (เดิมชื่อ Pilots)**
   - ตาราง `pilots` ถูก rename เป็น `operators`
   - รองรับทั้งนักบินโดรนและผู้ควบคุมเครื่องจักร

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- ตรวจสอบ console logs
- ตรวจสอบ Supabase logs
- ตรวจสอบว่า SQL migration รันสำเร็จหรือไม่

## 🎉 สรุป

ระบบจัดการเครื่องจักรให้เช่าถูกเพิ่มเข้ามาในระบบโดรนพ่นยาแล้ว!

**URL สำคัญ:**
- Admin: `/admin/equipment`
- LINE LIFF (Rental): `/line/liff/rental`
- LINE LIFF (Service): `/line/liff/booking`

**ขั้นตอนต่อไป:**
1. รัน SQL migration
2. เข้า Admin Panel ทดสอบเพิ่มเครื่องจักร
3. เปิด LINE LIFF ทดสอบจองเช่า
4. ตรวจสอบการบันทึกข้อมูลใน database

Happy Coding! 🚀
