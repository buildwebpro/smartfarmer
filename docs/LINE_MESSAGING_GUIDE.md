# คู่มือ LINE Messaging พร้อม Gemini AI

## 🚀 ภาพรวม

ระบบ LINE Messaging ได้รับการปรับปรุงให้:
- ✅ ดึงข้อมูลจริงจากฐานข้อมูล Supabase
- ✅ ใช้ Gemini AI ตอบคำถามอัตโนมัติ
- ✅ รองรับทั้งบริการพ่นยาโดรนและเช่าเครื่องจักร
- ✅ มี Rich Menu สำหรับเกษตรกรและ Provider
- ✅ ตรวจสอบสถานะการจองแบบ real-time

## 📋 คำสั่งที่รองรับ

### 1. บริการหลัก

| คำสั่ง | การทำงาน | ตัวอย่าง |
|--------|----------|----------|
| `จองโดรน`, `พ่นยา` | แสดงหน้าจองบริการโดรน | "ต้องการจองโดรน" |
| `เช่าเครื่องจักร`, `เครื่องจักร` | แสดงรายการเครื่องจักรให้เช่า | "อยากเช่าเครื่องจักร" |
| `ประวัติ`, `รายการจอง` | ดูประวัติการจองทั้งหมด | "ดูประวัติการจอง" |
| `สถานะ`, `ตรวจสอบ` | ตรวจสอบสถานะล่าสุด | "ตรวจสอบสถานะ" |
| `ราคา`, `price` | ดูราคาบริการจากฐานข้อมูล | "ดูราคา" |
| `ช่วยเหลือ`, `help` | แสดงวิธีใช้งาน | "ช่วยเหลือ" |

### 2. Gemini AI

สำหรับคำถามทั่วไป ระบบจะใช้ Gemini AI ตอบอัตโนมัติ:

**ตัวอย่างคำถาม:**
- "โดรนพ่นยาข้าวควรใช้สารอะไร"
- "การพ่นยาข้าวโพดควรทำช่วงไหน"
- "มีเครื่องไถนาให้เช่าไหม"
- "ค่าบริการคำนวณยังไง"
- "ต้องจองล่วงหน้ากี่วัน"

## 🤖 การทำงานของ Gemini AI

### Configuration
```typescript
// lib/gemini/ai-helper.ts
const GEMINI_API_KEY = "AIzaSyDcMzY_EyWAOMK1o7DGek37b8DjKKAdpDM"
```

### System Instruction
AI จะตอบตามข้อมูลบริษัท:
- บริการที่มี: พ่นยาโดรน, เช่าเครื่องจักร
- ราคาตามชนิดพืชและสารพ่น
- เงื่อนไขการเช่า
- ข้อมูลติดต่อ

### ตัวอย่างการใช้งาน

```typescript
import { getAIResponse, shouldUseAI } from "@/lib/gemini/ai-helper"

if (shouldUseAI(messageText)) {
  const aiResponse = await getAIResponse(messageText)
  // ส่งคำตอบกลับผ่าน LINE
}
```

## 🎨 Rich Menu

### Rich Menu สำหรับเกษตรกร
```
┌─────────┬─────────┬─────────┐
│ จอง     │ เช่า    │ ประวัติ │
│ โดรน    │ เครื่อง │ การจอง  │
├─────────┼─────────┼─────────┤
│ ดูราคา  │ ถาม AI  │ ติดต่อ  │
└─────────┴─────────┴─────────┘
```

**Areas:**
1. จองพ่นยาโดรน → เปิด LIFF `/line/liff/booking`
2. เช่าเครื่องจักร → เปิด LIFF `/line/liff/rental`
3. ประวัติการจอง → เปิด LIFF `/line/liff/my-bookings`
4. ดูราคา → ส่งข้อความ "ราคา"
5. ถามคำถาม → ส่งข้อความ "สอบถามข้อมูล"
6. ติดต่อเจ้าหน้าที่ → ส่งข้อความ "ต้องการความช่วยเหลือ"

### Rich Menu สำหรับ Provider (เจ้าของเครื่องจักร)
```
┌─────────┬─────────┬─────────┐
│ คำขอ    │ จัดการ  │ สถานะ   │
│ เช่า     │ เครื่อง │ การเช่า │
├─────────┼─────────┼─────────┤
│ รายงาน  │ แจ้ง    │ ช่วย    │
│ รายได้  │ ปัญหา   │ เหลือ   │
└─────────┴─────────┴─────────┘
```

## 📡 API Endpoints

### 1. Webhook (รับข้อความจาก LINE)
```
POST /api/line/webhook
```

**Flow:**
1. รับ event จาก LINE
2. Verify signature
3. แยกประเภทคำสั่ง
4. ดึงข้อมูลจาก Supabase
5. ใช้ AI ตอบ (ถ้าเป็นคำถามทั่วไป)
6. ส่งคำตอบกลับ

### 2. Rich Menu Management
```
POST /api/line/richmenu
GET /api/line/richmenu
DELETE /api/line/richmenu?richMenuId={id}
```

**Actions:**
- `create` - สร้าง Rich Menu
- `setDefault` - ตั้งเป็นค่าเริ่มต้น
- `linkToUser` - ผูกกับผู้ใช้เฉพาะ

## 🔧 การตั้งค่า

### Environment Variables
```env
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Gemini AI Setup
```typescript
// lib/gemini/ai-helper.ts
const GEMINI_API_KEY = "AIzaSyDcMzY_EyWAOMK1o7DGek37b8DjKKAdpDM"
```

## 📊 ข้อมูลที่ดึงจากฐานข้อมูล

### 1. ราคาบริการ
```sql
-- ชนิดพืช
SELECT name, price_per_rai
FROM crop_types
WHERE is_active = true

-- ชนิดสารพ่น
SELECT name, price_per_rai
FROM spray_types
WHERE is_active = true
```

### 2. เครื่องจักรให้เช่า
```sql
SELECT name, model, rental_price_per_day
FROM equipment
WHERE is_active = true AND status = 'available'
```

### 3. สถานะการจอง
```sql
SELECT booking_code, status, total_price
FROM bookings
WHERE line_user_id = {userId}
ORDER BY created_at DESC
LIMIT 1
```

## 🎯 Message Templates

### 1. จองบริการโดรน
```json
{
  "type": "flex",
  "altText": "จองบริการพ่นยาโดรน",
  "contents": {
    "type": "bubble",
    "hero": { ... },
    "body": {
      "contents": [
        "🚁 บริการพ่นยาโดรน",
        "✅ โดรนพร้อมให้บริการ 6 ลำ",
        "✅ นักบินมืออาชีพมีใบอนุญาต",
        "💰 ราคาเริ่มต้น 300 บาท/ไร่"
      ]
    },
    "footer": {
      "button": "เริ่มจองบริการ"
    }
  }
}
```

### 2. ราคาบริการ (Dynamic)
```typescript
// ดึงข้อมูลจริงจาก DB
const { data: cropTypes } = await supabase
  .from("crop_types")
  .select("name, price_per_rai")

// สร้าง Flex Message แบบ dynamic
const cropContents = cropTypes.map(crop => ({
  type: "box",
  contents: [
    { text: `• ${crop.name}` },
    { text: `${crop.price_per_rai} บาท/ไร่` }
  ]
}))
```

### 3. AI Response
```typescript
const aiResponse = await getAIResponse(userMessage)

await sendLineMessage(userId, {
  type: "text",
  text: `🤖 AI Assistant:\n\n${aiResponse}\n\n---\nพิมพ์ "ช่วยเหลือ" เพื่อดูเมนูทั้งหมด`
})
```

## 🧪 การทดสอบ

### 1. ทดสอบ Webhook
```bash
# ส่ง test message ผ่าน LINE Developer Console
# หรือใช้ ngrok tunnel
ngrok http 3000
```

### 2. ทดสอบ AI
```typescript
// lib/gemini/ai-helper.ts
const response = await getAIResponse("โดรนพ่นยาข้าวควรใช้สารอะไร")
console.log(response)
```

### 3. ทดสอบ Rich Menu
```bash
curl -X POST http://localhost:3000/api/line/richmenu \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "menuType": "farmer"
  }'
```

## 🔐 Security

### Signature Verification
```typescript
function verifySignature(body: string, signature: string | null): boolean {
  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(body, "utf8")
    .digest("base64")

  return hash === signature
}
```

### Input Sanitization
- ใช้ `sanitizeInput()` จาก `lib/security.ts`
- Validate ข้อมูลก่อนส่งเข้า DB

## 📈 Analytics & Monitoring

### Logging
```typescript
console.log("Message from user:", userId, "text:", messageText)
console.log("AI Response:", aiResponse)
console.log("Message sent successfully")
```

### Metrics ที่ควรติดตาม
- จำนวนข้อความที่รับ
- คำสั่งที่ใช้บ่อย
- AI usage rate
- Response time

## 🚀 Deployment

### 1. Deploy to Vercel/Production
```bash
# ตั้งค่า Environment Variables
vercel env add LINE_CHANNEL_ACCESS_TOKEN
vercel env add LINE_CHANNEL_SECRET

# Deploy
vercel --prod
```

### 2. อัพเดท LINE Webhook URL
```
https://your-domain.com/api/line/webhook
```

### 3. Setup Rich Menu
```bash
# สร้าง Rich Menu ผ่าน API
curl -X POST https://your-domain.com/api/line/richmenu \
  -d '{"action":"create","menuType":"farmer"}'

# ตั้งเป็นค่าเริ่มต้น
curl -X POST https://your-domain.com/api/line/richmenu \
  -d '{"action":"setDefault","richMenuId":"richmenu-xxx"}'
```

## 📝 Notes

1. **LIFF URL** - ใช้ production URL เมื่อ deploy
2. **Rich Menu Images** - ควรอัพโหลดรูปภาพขนาด 2500x1686 px
3. **AI Limits** - Gemini API มี rate limit ควรเพิ่ม caching
4. **Error Handling** - ทุก function มี try-catch

## 🆘 Troubleshooting

### ปัญหา: Webhook ไม่ทำงาน
- ตรวจสอบ signature verification
- ดู console logs
- ทดสอบผ่าน ngrok

### ปัญหา: AI ไม่ตอบ
- ตรวจสอบ Gemini API key
- ดู error logs
- ลอง test โดยตรง

### ปัญหา: Rich Menu ไม่แสดง
- ตรวจสอบ LINE_CHANNEL_ACCESS_TOKEN
- ดู Rich Menu list ผ่าน API
- ลองสร้างใหม่

## 🎉 Summary

✅ LINE Messaging พร้อมใช้งาน
✅ Gemini AI ตอบคำถามอัตโนมัติ
✅ ข้อมูลดึงจากฐานข้อมูลจริง
✅ Rich Menu สำหรับ 2 กลุ่มผู้ใช้
✅ API พร้อมสำหรับจัดการ

**ระบบพร้อม Deploy แล้ว!** 🚀
