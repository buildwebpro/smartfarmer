# สรุปการอัพเดท LINE Messaging System

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. 🤖 เพิ่ม Gemini AI
**ไฟล์:** `lib/gemini/ai-helper.ts`

**Features:**
- ตอบคำถามอัตโนมัติด้วย Gemini AI
- มี System Instruction เฉพาะสำหรับบริษัท
- ตอบตามข้อมูลบริการจริง (โดรน, เครื่องจักร, ราคา)
- แยกคำสั่งเฉพาะกับคำถามทั่วไป

**API Key:** `AIzaSyDcMzY_EyWAOMK1o7DGek37b8DjKKAdpDM`

**ตัวอย่างคำถามที่ AI ตอบได้:**
- "โดรนพ่นยาข้าวควรใช้สารอะไร"
- "การพ่นยาข้าวโพดควรทำช่วงไหน"
- "มีเครื่องไถให้เช่าไหม"
- "ค่าบริการคำนวณยังไง"

### 2. 🔄 ปรับปรุง LINE Webhook
**ไฟล์:** `app/api/line/webhook/route.ts`

**การเปลี่ยนแปลง:**

#### A. รองรับบริการครบถ้วน
```typescript
// เดิม: จองโดรนอย่างเดียว
if (lowerMessage.includes("จอง")) {
  await handleBookingRequest(userId)
}

// ใหม่: รองรับทั้งโดรนและเครื่องจักร
if (lowerMessage.includes("จองโดรน") || lowerMessage.includes("พ่นยา")) {
  await handleDroneBookingRequest(userId)  // เฉพาะโดรน
} else if (lowerMessage.includes("เช่าเครื่อง") || lowerMessage.includes("เครื่องจักร")) {
  await handleEquipmentRentalRequest(userId)  // เช่าเครื่องจักร
}
```

#### B. ดึงข้อมูลจริงจาก Supabase
```typescript
// ราคาบริการ
const { data: cropTypes } = await supabase
  .from("crop_types")
  .select("name, price_per_rai")
  .eq("is_active", true)

// เครื่องจักรให้เช่า
const { data: equipment } = await supabase
  .from("equipment")
  .select("name, model, rental_price_per_day")
  .eq("status", "available")

// สถานะการจอง
const { data: bookings } = await supabase
  .from("bookings")
  .select("*")
  .eq("line_user_id", userId)
  .order("created_at", { ascending: false })
  .limit(1)
```

#### C. เพิ่ม AI Response
```typescript
else if (shouldUseAI(messageText)) {
  const aiResponse = await getAIResponse(messageText)
  await sendLineMessage(userId, {
    type: "text",
    text: `🤖 AI Assistant:\n\n${aiResponse}`
  })
}
```

### 3. 📱 Rich Menu System
**ไฟล์:** `lib/line/richmenu.ts`

**2 แบบ Rich Menu:**

#### A. Rich Menu สำหรับเกษตรกร
```
┌─────────┬─────────┬─────────┐
│ 🚁      │ 🚜      │ 📋      │
│ จอง     │ เช่า    │ ประวัติ │
│ โดรน    │ เครื่อง │ การจอง  │
├─────────┼─────────┼─────────┤
│ 💰      │ 🤖      │ 📞      │
│ ดูราคา  │ ถาม AI  │ ติดต่อ  │
└─────────┴─────────┴─────────┘
```

**Actions:**
1. เปิด LIFF จองโดรน
2. เปิด LIFF เช่าเครื่องจักร
3. เปิด LIFF ดูประวัติ
4. ส่งข้อความ "ราคา"
5. ส่งข้อความ "สอบถามข้อมูล" (AI)
6. ส่งข้อความ "ต้องการความช่วยเหลือ"

#### B. Rich Menu สำหรับ Provider
```
┌─────────┬─────────┬─────────┐
│ 📥      │ 🔧      │ 📊      │
│ คำขอ    │ จัดการ  │ สถานะ   │
│ เช่า     │ เครื่อง │ การเช่า │
├─────────┼─────────┼─────────┤
│ 💵      │ ⚠️      │ ❓      │
│ รายงาน  │ แจ้ง    │ ช่วย    │
│ รายได้  │ ปัญหา   │ เหลือ   │
└─────────┴─────────┴─────────┘
```

### 4. 🔌 Rich Menu API
**ไฟล์:** `app/api/line/richmenu/route.ts`

**Endpoints:**

```typescript
// สร้าง Rich Menu
POST /api/line/richmenu
{
  "action": "create",
  "menuType": "farmer" // or "provider"
}

// ตั้งเป็นค่าเริ่มต้น
POST /api/line/richmenu
{
  "action": "setDefault",
  "richMenuId": "richmenu-xxx"
}

// ผูกกับผู้ใช้เฉพาะ
POST /api/line/richmenu
{
  "action": "linkToUser",
  "userId": "Uxxxx",
  "richMenuId": "richmenu-xxx"
}

// ดูรายการ Rich Menu
GET /api/line/richmenu

// ลบ Rich Menu
DELETE /api/line/richmenu?richMenuId=xxx
```

### 5. 📚 เอกสารคู่มือ
**ไฟล์:** `docs/LINE_MESSAGING_GUIDE.md`

**เนื้อหา:**
- คำสั่งที่รองรับทั้งหมด
- วิธีใช้ Gemini AI
- Rich Menu configuration
- Message templates
- API documentation
- Testing guide
- Deployment steps

## 🎯 คำสั่งที่รองรับ (อัพเดทแล้ว)

### เดิม (มีแค่โดรน)
- ❌ "จอง" → จองโดรนเท่านั้น
- ❌ "สถานะ" → ไม่มีข้อมูลจริง
- ❌ "ราคา" → ข้อมูล hardcode

### ใหม่ (ครบถ้วน)
- ✅ "จองโดรน", "พ่นยา" → จองบริการโดรน + LIFF
- ✅ "เช่าเครื่องจักร" → แสดงเครื่องจักรจาก DB + LIFF
- ✅ "ประวัติการจอง" → เปิด LIFF ดูประวัติ
- ✅ "สถานะ" → ดึงข้อมูลจริงจาก DB
- ✅ "ราคา" → ดึงราคาจาก crop_types & spray_types
- ✅ "ถามอะไรก็ได้" → Gemini AI ตอบอัตโนมัติ
- ✅ "ช่วยเหลือ" → แสดงคำสั่งทั้งหมด

## 🔄 Message Flow ใหม่

```
User → พิมพ์ข้อความ
         ↓
LINE → Webhook → /api/line/webhook
         ↓
ตรวจสอบคำสั่ง:
├─ "จองโดรน" → Flex Message + LIFF
├─ "เช่าเครื่อง" → Query DB → Flex Message + LIFF
├─ "ราคา" → Query DB → Dynamic Flex Message
├─ "สถานะ" → Query DB → แสดงสถานะล่าสุด
└─ อื่นๆ → Gemini AI → ตอบคำถาม
         ↓
ส่งกลับผ่าน LINE API
```

## 📊 การดึงข้อมูล

### Database Queries

```sql
-- 1. ราคาพืช
SELECT name, price_per_rai
FROM crop_types
WHERE is_active = true
ORDER BY name

-- 2. ราคาสารพ่น
SELECT name, price_per_rai
FROM spray_types
WHERE is_active = true
ORDER BY name

-- 3. เครื่องจักรพร้อมเช่า
SELECT name, model, rental_price_per_day
FROM equipment
WHERE is_active = true AND status = 'available'
LIMIT 3

-- 4. สถานะการจองล่าสุด
SELECT booking_code, status, total_price
FROM bookings
WHERE line_user_id = {userId}
ORDER BY created_at DESC
LIMIT 1
```

## 🚀 วิธีใช้งาน

### 1. ทดสอบ Webhook (Local)
```bash
# Start dev server
npm run dev

# ใช้ ngrok tunnel
ngrok http 3000

# อัพเดท Webhook URL ใน LINE Console
https://xxxx.ngrok.io/api/line/webhook
```

### 2. ทดสอบ AI
```typescript
import { getAIResponse } from "@/lib/gemini/ai-helper"

const response = await getAIResponse("โดรนพ่นยาข้าวควรใช้สารอะไร")
console.log(response)
```

### 3. สร้าง Rich Menu
```bash
# สร้าง Rich Menu สำหรับเกษตรกร
curl -X POST http://localhost:3000/api/line/richmenu \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "menuType": "farmer"
  }'

# Response
{
  "success": true,
  "richMenuId": "richmenu-xxx",
  "message": "Created farmer rich menu successfully"
}
```

### 4. ตั้งเป็นค่าเริ่มต้น
```bash
curl -X POST http://localhost:3000/api/line/richmenu \
  -H "Content-Type: application/json" \
  -d '{
    "action": "setDefault",
    "richMenuId": "richmenu-xxx"
  }'
```

## 📝 ไฟล์ที่สร้าง/แก้ไข

### ไฟล์ใหม่
1. ✅ `lib/gemini/ai-helper.ts` - Gemini AI helper
2. ✅ `lib/line/richmenu.ts` - Rich Menu configuration
3. ✅ `app/api/line/richmenu/route.ts` - Rich Menu API
4. ✅ `docs/LINE_MESSAGING_GUIDE.md` - คู่มือการใช้งาน
5. ✅ `docs/LINE_MESSAGING_UPDATE_SUMMARY.md` - เอกสารนี้

### ไฟล์ที่แก้ไข
1. ✅ `app/api/line/webhook/route.ts` - เพิ่ม AI, ดึงข้อมูล DB
2. ✅ `package.json` - เพิ่ม @google/generative-ai

## 🎨 Flex Message Examples

### 1. Welcome Message
- Hero image
- บริการทั้งหมด: โดรน, เครื่องจักร
- 3 ปุ่ม: จองโดรน, เช่าเครื่อง, ถาม AI

### 2. ราคาบริการ (Dynamic)
- ดึงข้อมูลจาก DB real-time
- แสดงราคาพืชและสาร
- สูตรคำนวณ + มัดจำ 30%

### 3. สถานะการจอง (Dynamic)
- แสดงรหัสจอง
- สถานะปัจจุบัน (มี emoji)
- ยอดเงินรวม

### 4. เครื่องจักร (Dynamic)
- แสดง 3 เครื่องแรก
- ชื่อ, รุ่น, ราคาต่อวัน
- ปุ่มดูทั้งหมด → LIFF

## 🔒 Security

- ✅ Signature verification
- ✅ Environment variables
- ✅ Input sanitization
- ✅ Rate limiting (ควรเพิ่ม)

## ⚡ Performance

- ✅ Query เฉพาะข้อมูลที่ต้องการ
- ✅ Limit results
- ✅ Index บน database
- ⏳ AI Caching (ควรเพิ่ม)

## 🆘 การ Deploy

### Production Checklist
- [ ] อัพเดท `NEXT_PUBLIC_BASE_URL`
- [ ] อัพโหลด Rich Menu images (2500x1686 px)
- [ ] ตั้งค่า Webhook URL ใน LINE Console
- [ ] สร้าง Rich Menu ผ่าน API
- [ ] ทดสอบทุก command
- [ ] Monitor Gemini API usage

### Environment Variables
```env
LINE_CHANNEL_ACCESS_TOKEN=your_token
LINE_CHANNEL_SECRET=your_secret
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## ✨ สรุป

### ปรับปรุงแล้ว
- ✅ ดึงข้อมูลจริงจาก Supabase
- ✅ Gemini AI ตอบคำถามอัตโนมัติ
- ✅ รองรับทั้งโดรนและเครื่องจักร
- ✅ Rich Menu 2 แบบ (เกษตรกร + Provider)
- ✅ API จัดการ Rich Menu
- ✅ เอกสารคู่มือครบถ้วน

### พร้อมใช้งาน
🎉 **LINE Messaging System อัพเดทเสร็จสมบูรณ์!**

**ตอนนี้ LINE Chat จะ:**
- แสดงข้อมูลจริงจากระบบ
- ตอบคำถามอัตโนมัติด้วย AI
- รองรับบริการครบถ้วน
- มีเมนูสะดวกสำหรับผู้ใช้
