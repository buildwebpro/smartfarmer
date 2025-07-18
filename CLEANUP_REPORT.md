# ไฟล์ที่ควรลบออกจากระบบ

## ไฟล์ที่ปลอดภัยลบได้
1. app/api/line/test/route.ts - Test endpoint
2. app/api/line/debug/route.ts - Debug endpoint (เปิดเผย config)
3. app/api/line/webhook-test/route.ts - Webhook test
4. public/placeholder*.jpg - รูปภาพ placeholder ที่ไม่ใช้

## ไฟล์ที่ควรแก้ไข
1. app/line/liff/booking/page.tsx - เอา console.log ออก
2. app/api/line/webhook/route.ts - เอา console.log ออก

## หมายเหตุ
- ไฟล์ทั้งหมดได้รับการตรวจสอบแล้วว่าไม่ใช่ไฟล์ที่ใช้งานจริง
- การลบไฟล์เหล่านี้จะไม่ส่งผลต่อการทำงานของระบบ
- แนะนำให้ลบไฟล์ debug/test ก่อนปล่อยใช้งานจริง
