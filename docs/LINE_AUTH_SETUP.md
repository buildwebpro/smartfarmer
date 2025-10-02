# LINE Authentication Setup - Complete Guide

## Overview

SmartFarmer ใช้ LINE Login เป็นระบบ authentication หลัก ช่วยให้เกษตรกรและผู้ให้บริการเข้าสู่ระบบได้ง่ายผ่าน LINE account ที่มีอยู่แล้ว

## Setup Steps

### 1. สร้าง LINE Login Channel

1. ไปที่ https://developers.line.biz/console/
2. สร้าง Provider (ถ้ายังไม่มี)
3. คลิก "Create a new channel"
4. เลือก **"LINE Login"**
5. กรอกข้อมูล:
   - Channel name: `SmartFarmer`
   - Channel description: `Marketplace for Agriculture`
   - App types: เลือก `Web app`
6. คลิก "Create"

### 2. Configure Callback URL

1. ไปที่ channel ที่สร้าง
2. ไปที่แท็บ **"LINE Login"**
3. ใน **Callback URL** เพิ่ม:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```
4. ใน **Link URL** (optional):
   ```
   http://localhost:3000
   https://your-domain.com
   ```

### 3. ดึง Credentials

ไปที่แท็บ **"Basic settings"**:
- **Channel ID**: คัดลอกเก็บไว้
- **Channel secret**: คัดลอกเก็บไว้ (กด Show)

### 4. Setup Environment Variables

สร้างไฟล์ `.env.local` และเพิ่ม:

```env
# LINE Login
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=2006634414
LINE_LOGIN_CHANNEL_SECRET=your-channel-secret
NEXT_PUBLIC_LINE_CALLBACK_URL=http://localhost:3000/auth/callback
```

**สำคัญ**: ห้าม commit `LINE_LOGIN_CHANNEL_SECRET` ลง git!

### 5. รัน SQL Migration

รัน SQL นี้ใน Supabase SQL Editor เพื่อเพิ่ม `line_user_id` column:

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_customers_line_user_id ON customers(line_user_id);
```

หรือรันไฟล์:
```bash
# ใน Supabase SQL Editor
# รันไฟล์: scripts/add-line-user-id.sql
```

## Authentication Flow

### 1. Landing Page (`/`)

```
User เลือก Role → เกษตรกร (Farmer) หรือ ผู้ให้บริการ (Provider)
                ↓
        คลิก "เข้าสู่ระบบด้วย LINE"
                ↓
    บันทึก role ลง sessionStorage
                ↓
    Redirect ไป LINE OAuth
```

### 2. LINE OAuth

```
LINE ขอ permission:
- Profile (displayName, pictureUrl)
- Email (optional)
- OpenID
                ↓
User อนุญาต → LINE redirect กลับ
```

### 3. Callback Handler (`/auth/callback`)

```typescript
// app/auth/callback/page.tsx
1. รับ authorization code จาก LINE
2. ตรวจสอบ state parameter (CSRF protection)
3. ส่ง code + role ไป API
4. รับ user data
5. ตั้ง cookies และ localStorage
6. Redirect ไป dashboard ตาม role
```

### 4. API Endpoint (`/api/auth/line/callback`)

```typescript
// app/api/auth/line/callback/route.ts
1. Exchange code → access_token (LINE API)
2. ดึง profile จาก LINE
3. สร้างหรืออัพเดต user ใน Supabase
4. Return user data
```

### 5. Middleware Protection

```typescript
// middleware.ts
1. ตรวจสอบ user และ user_role cookies
2. ถ้าไม่มี → redirect ไป /
3. ถ้า role ไม่ตรง → redirect ไป dashboard ที่ถูกต้อง
4. อนุญาตเข้าถึง
```

## Database Schema

### customers table (extended)

```sql
ALTER TABLE customers
ADD COLUMN line_user_id VARCHAR(255) UNIQUE,
ADD COLUMN role VARCHAR(20) DEFAULT 'farmer',
ADD COLUMN avatar_url VARCHAR(500);
```

**Columns:**
- `id` (UUID) - Primary key
- `name` (VARCHAR) - จาก LINE displayName
- `email` (VARCHAR) - จาก LINE email (optional)
- `line_user_id` (VARCHAR) - LINE User ID (unique)
- `avatar_url` (VARCHAR) - จาก LINE pictureUrl
- `role` (VARCHAR) - 'farmer' | 'provider' | 'admin'
- `verified` (BOOLEAN) - สถานะการยืนยันตัวตน

## Security Features

### 1. State Parameter (CSRF Protection)
```typescript
const STATE = Math.random().toString(36).substring(7)
sessionStorage.setItem('line_state', STATE)

// Verify ใน callback
if (state !== savedState) {
  throw new Error('Invalid state parameter')
}
```

### 2. Cookie Settings
```typescript
document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=86400` // 24h
document.cookie = `user_role=${result.user.role}; path=/; max-age=86400`
```

### 3. Middleware Protection
- Protected routes: `/farmer/*`, `/provider/*`, `/admin/*`
- Auto-redirect ถ้าไม่มี auth
- Role-based access control

## Testing

### Local Development

1. เริ่ม dev server:
```bash
npm run dev
```

2. ไปที่ http://localhost:3000

3. เลือก role และกด "เข้าสู่ระบบด้วย LINE"

4. ตรวจสอบ:
   - LINE Login popup
   - Callback redirect
   - Dashboard redirect ตาม role

### Debug Tools

**Check cookies:**
```javascript
// In browser console
document.cookie
```

**Check localStorage:**
```javascript
localStorage.getItem('user')
localStorage.getItem('user_role')
```

**Check LINE token:**
```bash
# ใน API endpoint
console.log('LINE access_token:', access_token)
console.log('LINE profile:', lineProfile)
```

## Troubleshooting

### Error: "Invalid state parameter"
- **สาเหตุ**: sessionStorage ถูกล้าง หรือ CSRF attack
- **แก้ไข**: ลองใหม่, ตรวจสอบ browser cookies

### Error: "Failed to exchange authorization code"
- **สาเหตุ**: Channel Secret ผิด หรือ Callback URL ไม่ตรง
- **แก้ไข**:
  1. ตรวจสอบ `.env.local` มี `LINE_LOGIN_CHANNEL_SECRET`
  2. ตรวจสอบ Callback URL ใน LINE Console ตรงกับ `.env.local`

### Error: "Failed to fetch LINE profile"
- **สาเหตุ**: Access token หมดอายุ หรือ invalid
- **แก้ไข**: ลองใหม่, ตรวจสอบ network tab

### Redirect ไม่ทำงาน
- **สาเหตุ**: Middleware blocking
- **แก้ไข**:
  1. ตรวจสอบ cookies ถูกตั้งค่าแล้ว
  2. ดู console log ใน middleware

### User ไม่ถูกสร้างใน Supabase
- **สาเหตุ**: RLS policy blocking
- **แก้ไข**:
  1. รัน migration ที่มี RLS policies
  2. ใช้ Service Role Key ใน API

## Production Deployment

### Vercel

1. เพิ่ม Environment Variables:
```
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=xxx
LINE_LOGIN_CHANNEL_SECRET=xxx
NEXT_PUBLIC_LINE_CALLBACK_URL=https://your-app.vercel.app/auth/callback
```

2. อัพเดต LINE Console:
   - Callback URL: `https://your-app.vercel.app/auth/callback`
   - Link URL: `https://your-app.vercel.app`

3. Deploy:
```bash
vercel --prod
```

### Security Checklist

- [ ] `LINE_LOGIN_CHANNEL_SECRET` อยู่ใน Environment Variables เท่านั้น
- [ ] Callback URL ตรงกับ production domain
- [ ] HTTPS enabled (Vercel auto)
- [ ] State parameter verification enabled
- [ ] Cookie `Secure` flag enabled in production
- [ ] RLS policies enabled ทุก table

## API Reference

### POST /api/auth/line/callback

**Request:**
```json
{
  "code": "authorization_code_from_line",
  "role": "farmer" | "provider"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@line.user",
    "avatar_url": "https://...",
    "role": "farmer",
    "line_user_id": "U1234567890abcdef"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Next Steps

หลัง setup LINE Auth เสร็จแล้ว:

1. ✅ Test authentication flow
2. ✅ ตรวจสอบ user ถูกสร้างใน Supabase
3. ⏳ เพิ่ม profile setup page (ครั้งแรกที่ login)
4. ⏳ เพิ่ม logout functionality
5. ⏳ LINE Messaging API integration (notifications)

---

สร้างโดย: Claude Code
อัพเดตล่าสุด: 2025-10-02
