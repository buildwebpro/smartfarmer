# 🚀 LINE Webhook Setup Instructions

## 1. ตั้งค่า Environment Variables ใน Vercel

### ขั้นตอน:
1. ไปที่ https://vercel.com/dashboard
2. เลือก project "drone-service-app" 
3. ไปที่ Settings > Environment Variables
4. เพิ่ม variables ต่อไปนี้:

\`\`\`env
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here  
ADMIN_LINE_USER_ID=your_line_user_id_here
NEXT_PUBLIC_BASE_URL=https://drone-service-app.vercel.app
NEXT_PUBLIC_LIFF_ID=your_liff_id_here
\`\`\`

## 2. หา Channel Secret และ Access Token

### ขั้นตอน:
1. ไปที่ https://developers.line.biz/console/
2. เลือก Provider และ Channel ของคุณ
3. ไปที่ **Basic settings** tab:
   - Copy **Channel secret** ไปใส่ใน `LINE_CHANNEL_SECRET`
4. ไปที่ **Messaging API** tab:
   - กด **Issue** เพื่อสร้าง Channel access token
   - Copy token ไปใส่ใน `LINE_CHANNEL_ACCESS_TOKEN`

## 3. หา LINE User ID ของ Admin

### วิธี 1: ใช้ LINE Official Account Manager
1. ไปที่ https://manager.line.biz/
2. เลือก account ของคุณ
3. ไปที่ Settings > Response settings
4. ดู User ID

### วิธี 2: ส่งข้อความหา Bot แล้วดู logs
1. Add bot เป็นเพื่อน
2. ส่งข้อความ "test"
3. ดู logs ใน Vercel Functions
4. หา userId ใน logs

## 4. ตั้งค่า Webhook URL

### ขั้นตอน:
1. ใน LINE Developers Console
2. ไปที่ **Messaging API** tab
3. ใส่ Webhook URL: `https://drone-booking-app.vercel.app/api/line/webhook`
4. กด **Verify** 
5. ถ้าผ่านจะขึ้น ✅
6. เปิด **Use webhook**
7. ปิด **Auto-reply messages**

## 5. สร้าง LIFF App (สำหรับ booking form)

### ขั้นตอน:
1. ใน LINE Developers Console
2. ไปที่ **LIFF** tab
3. กด **Add**
4. ตั้งค่า:
   - LIFF app name: "Drone Booking"
   - Size: Full
   - Endpoint URL: `https://drone-booking-app.vercel.app/line/liff/booking`
5. Copy **LIFF ID** ไปใส่ใน `NEXT_PUBLIC_LIFF_ID`

## 6. Deploy ใหม่

หลังตั้งค่า Environment Variables แล้ว:
1. ไปที่ Vercel Dashboard
2. กด **Redeploy** 
3. หรือ push code ใหม่

## 7. ทดสอบ

### ทดสอบ Webhook:
1. เข้า: https://drone-service-app.vercel.app/api/line/test
2. ควรเห็น status: "ok" และ environment variables

### ทดสอบ Bot:
1. Add bot เป็นเพื่อน
2. ส่งข้อความ "สวัสดี"
3. Bot ควรตอบกลับ

## 🆘 หากมีปัญหา

1. **Webhook verify ไม่ผ่าน**:
   - ตรวจสอบ `LINE_CHANNEL_SECRET` ถูกต้อง
   - ตรวจสอบ URL ถูกต้อง (HTTPS)

2. **Bot ไม่ตอบ**:
   - ตรวจสอบ `LINE_CHANNEL_ACCESS_TOKEN`
   - ดู logs ใน Vercel Functions

3. **LIFF ไม่ทำงาน**:
   - ตรวจสอบ `NEXT_PUBLIC_LIFF_ID`
   - ตรวจสอบ Endpoint URL ใน LIFF settings
