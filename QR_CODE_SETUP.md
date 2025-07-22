# QR Code Instructions

## วิธีเพิ่ม QR Code สำหรับ PromptPay

1. **นำไฟล์ QR Code ของคุณ** (รูปแบบ .jpg, .png, .webp) 
2. **วางไฟล์ในโฟลเดอร์** `public/images/`
3. **เปลี่ยนชื่อไฟล์เป็น** `qr-promptpay.jpg`

หรือ

**หากต้องการใช้ชื่อไฟล์อื่น** เช่น `my-qr-code.png`
ให้แจ้งมาแล้วเราจะปรับโค้ดให้ตรงกัน

## ตำแหน่งไฟล์ที่ถูกต้อง:
```
public/
  images/
    qr-promptpay.jpg  ← วางไฟล์ QR Code ตรงนี้
    drone-service-login-logo.webp
```

## การใช้งาน:
- ระบบจะแสดง QR Code นี้เมื่อลูกค้าส่งฟอร์มจองเรียบร้อยแล้ว
- ลูกค้าสามารถสแกน QR เพื่อชำระเงินมัดจำได้ทันที
