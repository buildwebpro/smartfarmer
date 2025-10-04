# คู่มือการใช้งานฟิลด์ใหม่ในระบบจองเครื่องจักรเกษตร

## การ Migration ฐานข้อมูล

### วิธีการรัน Migration

```bash
# เชื่อมต่อกับ Supabase และรัน migration
psql -h [your-supabase-host] -U postgres -d postgres -f scripts/add-booking-fields-migration.sql
```

หรือผ่าน Supabase Dashboard:
1. เข้า Supabase Dashboard → SQL Editor
2. Copy เนื้อหาจากไฟล์ `scripts/add-booking-fields-migration.sql`
3. Paste และกด Run

## ฟิลด์ใหม่ที่เพิ่มเข้ามา

### 1. ข้อมูลติดต่อ (Contact Information)

| ฟิลด์ | ประเภท | Required | หมายเหตุ |
|-------|--------|----------|----------|
| `customer_email` | string | ไม่จำเป็น | สำหรับส่งเอกสาร/ใบเสร็จ |
| `customer_phone` | string | **จำเป็น** | มีอยู่แล้ว - สำหรับติดต่อฉุกเฉิน |

### 2. ข้อมูลพื้นที่ใช้งาน (Farm Location)

| ฟิลด์ | ประเภท | Required | ตัวอย่าง |
|-------|--------|----------|----------|
| `farm_address` | string | **แนะนำมาก** | "123 หมู่ 5 ต.บ้านนา" |
| `district` | string | **แนะนำมาก** | "เมือง" |
| `province` | string | **แนะนำมาก** | "เชียงใหม่" |
| `farm_area_size` | number | ไม่จำเป็น | 10.5 (ไร่) |
| `crop_planted` | string | ไม่จำเป็น | "ข้าวหอมมะลิ" |
| `terrain_type` | enum | ไม่จำเป็น | 'flat', 'hilly', 'flooded', 'mixed' |

### 3. รายละเอียดการใช้งาน (Service Details)

| ฟิลด์ | ประเภท | Required | ตัวอย่าง |
|-------|--------|----------|----------|
| `service_type` | string | ไม่จำเป็น | "spray", "plow", "seed" |
| `pickup_datetime` | timestamp | ไม่จำเป็น | "2025-10-05T08:00:00+07:00" |
| `return_datetime` | timestamp | ไม่จำเป็น | "2025-10-05T16:00:00+07:00" |
| `estimated_work_duration` | number | ไม่จำเป็น | 4.5 (ชั่วโมง) |
| `urgency_level` | enum | ไม่จำเป็น | 'normal', 'urgent', 'very_urgent' |
| `preferred_work_time` | enum | ไม่จำเป็น | 'morning', 'afternoon', 'evening', 'night' |

### 4. ข้อมูลเพิ่มเติม (Additional Information)

| ฟิลด์ | ประเภท | Required | หมายเหตุ |
|-------|--------|----------|----------|
| `has_water_source` | boolean | ไม่จำเป็น | มีแหล่งน้ำในพื้นที่หรือไม่ |
| `has_obstacles` | boolean | ไม่จำเป็น | มีเสาไฟ/ต้นไม้กีดขวางหรือไม่ |
| `special_requirements` | string | ไม่จำเป็น | ความต้องการพิเศษ |
| `referral_source` | string | ไม่จำเป็น | รู้จักจาก: LINE, Facebook, เพื่อนแนะนำ |

### 5. เงื่อนไขการเช่า (Terms & Conditions)

| ฟิลด์ | ประเภท | Required | หมายเหตุ |
|-------|--------|----------|----------|
| `terms_accepted` | boolean | **แนะนำมาก** | ยอมรับเงื่อนไขการเช่า |
| `damage_policy_accepted` | boolean | **แนะนำมาก** | รับทราบนโยบายค่าเสียหาย |
| `fuel_responsibility_accepted` | boolean | **แนะนำมาก** | รับผิดชอบค่าน้ำมัน |
| `return_condition_accepted` | boolean | **แนะนำมาก** | คืนเครื่องในสภาพเรียบร้อย |
| `terms_accepted_at` | timestamp | auto | บันทึกเวลายอมรับเงื่อนไข |

## ตัวอย่างการใช้งาน API

### การสร้างการจองแบบใหม่ (Full Information)

```typescript
const bookingData = {
  // ข้อมูลพื้นฐาน (Required)
  customerName: "นายสมชาย ใจดี",
  phoneNumber: "081-234-5678",
  areaSize: "10",
  cropType: "rice",
  sprayType: "herbicide",
  selectedDate: "2025-10-10",
  totalPrice: 500,
  depositAmount: 250,
  status: "pending_payment",

  // ข้อมูลติดต่อเพิ่มเติม (Optional แต่แนะนำ)
  customerEmail: "somchai@example.com",

  // ที่อยู่ไร่/แปลง (แนะนำมาก)
  farmAddress: "123 หมู่ 5 ต.บ้านนา",
  district: "เมือง",
  province: "เชียงใหม่",
  farmAreaSize: 10.5,
  cropPlanted: "ข้าวหอมมะลิ",
  terrainType: "flat",

  // รายละเอียดการใช้งาน
  serviceType: "spray",
  pickupDatetime: "2025-10-10T08:00:00",
  returnDatetime: "2025-10-10T16:00:00",
  estimatedWorkDuration: 4,
  urgencyLevel: "normal",
  preferredWorkTime: "morning",

  // ข้อมูลเพิ่มเติม
  hasWaterSource: true,
  hasObstacles: false,
  specialRequirements: "กรุณาเตรียมน้ำสำรองด้วย",
  referralSource: "Facebook",

  // เงื่อนไขการเช่า (แนะนำมาก)
  termsAccepted: true,
  damagePolicyAccepted: true,
  fuelResponsibilityAccepted: true,
  returnConditionAccepted: true,

  // อื่นๆ
  gpsCoordinates: "18.7883,98.9853",
  notes: "โทรก่อนมาส่งเครื่อง",
  lineUserId: "U1234567890abcdef"
}

// ส่ง POST request
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
})
```

### การสร้างการจองแบบข้อมูลพื้นฐาน (Minimum Required)

```typescript
const minimalBooking = {
  customerName: "นายสมชาย ใจดี",
  phoneNumber: "081-234-5678",
  areaSize: "10",
  cropType: "rice",
  sprayType: "herbicide",
  selectedDate: "2025-10-10",
  totalPrice: 500,
  depositAmount: 250,
  status: "pending_payment"
}
```

## การใช้งานกับ LINE Login

### แนะนำให้มี 2 ทางเลือก:

#### 1. LINE Login (แนะนำสำหรับลูกค้าประจำ)

**ข้อดี:**
- ไม่ต้องกรอกข้อมูลซ้ำ
- ดูประวัติการเช่าได้
- รับการแจ้งเตือนผ่าน LINE
- จัดการการจองได้สะดวก

**ตัวอย่างการใช้:**
```typescript
// หลังจาก LINE Login สำเร็จ
const userProfile = await liff.getProfile()

const bookingData = {
  ...formData,
  lineUserId: userProfile.userId,
  customerName: userProfile.displayName,
  // ข้อมูลอื่นๆ ดึงจาก profile ที่เคยบันทึกไว้
}
```

#### 2. Guest Checkout (สำหรับลูกค้าใหม่/ไม่คุ้นเทคโนโลยี)

**ข้อดี:**
- ไม่ต้อง login
- จองได้รวดเร็ว
- เหมาะกับผู้ใช้ครั้งเดียว

**ตัวอย่าง:**
```typescript
const guestBooking = {
  ...formData,
  lineUserId: null, // ไม่มี LINE ID
  // ต้องกรอกข้อมูลเต็ม
  customerName: "นายสมชาย ใจดี",
  phoneNumber: "081-234-5678",
  customerEmail: "somchai@example.com"
}
```

## แนวทางการออกแบบฟอร์ม

### ขั้นที่ 1: ข้อมูลพื้นฐาน
```
- ชื่อ-นามสกุล ⭐⭐⭐
- เบอร์โทรศัพท์ ⭐⭐⭐
- อีเมล (optional)
- [ปุ่ม Login ด้วย LINE]
```

### ขั้นที่ 2: ที่อยู่แปลงเกษตร
```
- ที่อยู่ไร่/แปลง ⭐⭐⭐
- ตำบล/อำเภอ ⭐⭐⭐
- จังหวัด ⭐⭐⭐
- พิกัด GPS (optional - มีปุ่มตรวจจับตำแหน่ง)
```

### ขั้นที่ 3: รายละเอียดพื้นที่
```
- ขนาดพื้นที่ (ไร่) ⭐⭐⭐
- ประเภทพืชที่ปลูก
- ลักษณะภูมิประเทศ (dropdown)
- มีแหล่งน้ำหรือไม่ (checkbox)
- มีสิ่งกีดขวางหรือไม่ (checkbox)
```

### ขั้นที่ 4: กำหนดการ
```
- วันที่ต้องการใช้งาน ⭐⭐⭐
- ช่วงเวลาที่ต้องการ (dropdown)
- ความเร่งด่วน (radio button)
- ระยะเวลาโดยประมาณ (auto-calculate)
```

### ขั้นที่ 5: เงื่อนไขการเช่า
```
☑️ ยอมรับเงื่อนไขการเช่า
☑️ รับทราบนโยบายค่าเสียหาย
☑️ รับผิดชอบค่าน้ำมันเชื้อเพลิง
☑️ คืนเครื่องในสภาพเรียบร้อย

[ปุ่มยืนยันการจอง]
```

## การส่งการแจ้งเตือนผ่าน LINE

### ตัวอย่างข้อความแจ้งเตือน

#### 1. การจองสำเร็จ
```
✅ การจองสำเร็จ!

รหัสการจอง: DR1728123456789
ชื่อลูกค้า: นายสมชาย ใจดี
พื้นที่: 10 ไร่ (ข้าวหอมมะลิ)
วันที่: 10 ต.ค. 2568
เวลา: 08:00-16:00 น.

📍 สถานที่: ต.บ้านนา อ.เมือง จ.เชียงใหม่

โปรดโอนเงินมัดจำ 250 บาท
ภายใน 24 ชั่วโมง
```

#### 2. เตือนก่อนถึงวัน
```
⏰ เตือน: พรุ่งนี้ถึงวันรับเครื่อง!

รหัสการจอง: DR1728123456789
วันที่รับเครื่อง: 10 ต.ค. 2568 เวลา 08:00 น.

📍 สถานที่: ต.บ้านนา อ.เมือง จ.เชียงใหม่

กรุณาเตรียม:
- พื้นที่ให้พร้อม
- น้ำสำรอง (ถ้ามี)
- ทางเข้าสะดวก
```

## ข้อควรระวัง

1. **ข้อมูลที่อยู่** - ควรเก็บที่อยู่แยกระหว่าง customers (ที่อยู่ติดต่อ) กับ bookings (ที่อยู่แปลง)
2. **เบอร์โทรศัพท์** - ควร validate รูปแบบเบอร์ไทย (08x-xxx-xxxx)
3. **Terms & Conditions** - ควรบันทึก timestamp เมื่อมีการยอมรับ
4. **GPS Coordinates** - ควร validate รูปแบบ (latitude,longitude)
5. **Privacy** - อีเมลและเบอร์โทรควรเข้ารหัสหรือปกป้องตาม PDPA

## การทดสอบ

### 1. ทดสอบ Migration
```sql
-- ตรวจสอบว่าฟิลด์ถูกสร้างครบ
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN ('customer_email', 'farm_address', 'terrain_type', 'terms_accepted');
```

### 2. ทดสอบ API
```bash
# Test with curl
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d @test-booking.json
```

### 3. ทดสอบ TypeScript
```bash
npm run typecheck
```

## Rollback Plan

หากต้องการ rollback migration:

```sql
-- ลบฟิลด์ที่เพิ่มใหม่
ALTER TABLE bookings
  DROP COLUMN IF EXISTS customer_email,
  DROP COLUMN IF EXISTS farm_address,
  DROP COLUMN IF EXISTS district,
  DROP COLUMN IF EXISTS province,
  DROP COLUMN IF EXISTS farm_area_size,
  DROP COLUMN IF EXISTS crop_planted,
  DROP COLUMN IF EXISTS terrain_type,
  DROP COLUMN IF EXISTS pickup_datetime,
  DROP COLUMN IF EXISTS return_datetime,
  DROP COLUMN IF EXISTS estimated_work_duration,
  DROP COLUMN IF EXISTS service_type,
  DROP COLUMN IF EXISTS urgency_level,
  DROP COLUMN IF EXISTS preferred_work_time,
  DROP COLUMN IF EXISTS has_water_source,
  DROP COLUMN IF EXISTS has_obstacles,
  DROP COLUMN IF EXISTS special_requirements,
  DROP COLUMN IF EXISTS referral_source,
  DROP COLUMN IF EXISTS terms_accepted,
  DROP COLUMN IF EXISTS damage_policy_accepted,
  DROP COLUMN IF EXISTS fuel_responsibility_accepted,
  DROP COLUMN IF EXISTS return_condition_accepted,
  DROP COLUMN IF EXISTS terms_accepted_at;

-- ลบ indexes
DROP INDEX IF EXISTS idx_bookings_pickup_datetime;
DROP INDEX IF EXISTS idx_bookings_return_datetime;
DROP INDEX IF EXISTS idx_bookings_province;
DROP INDEX IF EXISTS idx_bookings_service_type;
DROP INDEX IF EXISTS idx_bookings_urgency_level;
```
