# LINE Login Setup Guide

## 1. สร้าง LINE Login Channel

1. เข้า https://developers.line.biz/console/
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. คลิก "Create a new channel"
4. เลือก **"LINE Login"**
5. กรอกข้อมูล:
   - Channel name: `SmartFarmer`
   - Channel description: `Marketplace for Agriculture`
   - App types: เลือก `Web app`
6. คลิก "Create"

## 2. Configure Callback URL

1. ไปที่ channel ที่สร้าง
2. ไปที่แท็บ **"LINE Login"**
3. ใน **Callback URL** เพิ่ม:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```
4. ใน **Link URL** เพิ่ม:
   ```
   http://localhost:3000
   https://your-domain.com
   ```

## 3. ดึง Credentials

ไปที่แท็บ **"Basic settings"**:
- **Channel ID**: คัดลอกเก็บไว้
- **Channel secret**: คัดลอกเก็บไว้ (กด Show)

## 4. เพิ่มใน .env.local

```env
# LINE Login
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=your-channel-id
LINE_LOGIN_CHANNEL_SECRET=your-channel-secret
NEXT_PUBLIC_LINE_CALLBACK_URL=http://localhost:3000/auth/callback
```

## 5. (Optional) LIFF Setup

ถ้าต้องการใช้ LIFF (LINE Front-end Framework):

1. ไปที่แท็บ **"LIFF"**
2. คลิก "Add"
3. กรอก:
   - LIFF app name: `SmartFarmer App`
   - Size: `Full`
   - Endpoint URL: `https://your-domain.com/liff`
4. คัดลอก **LIFF ID**
5. เพิ่มใน .env.local:
   ```env
   NEXT_PUBLIC_LIFF_ID=your-liff-id
   ```

---

ถ้าคุณมี Channel ID แล้ว บอกผมได้เลย จะช่วย config ให้!
