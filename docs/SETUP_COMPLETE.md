# LINE Login Setup - เสร็จสมบูรณ์! ✅

## สรุปสิ่งที่ติดตั้งแล้ว

### 1. ✅ Configuration
- **Channel ID**: `2007773973`
- **Channel Secret**: `efad6ca45c1dac3927f7979deefe053c`
- **Callback URL**: `http://localhost:3000/auth/callback`

ไฟล์ `.env.local` ถูกอัพเดตแล้ว

### 2. ✅ ไฟล์ที่สร้าง/อัพเดต

#### Authentication Flow:
- `app/page.tsx` - Landing page พร้อม role selection และ LINE Login
- `app/auth/callback/page.tsx` - Callback handler
- `app/api/auth/line/callback/route.ts` - API endpoint

#### Middleware & Security:
- `middleware.ts` - Route protection (farmer, provider, admin)

#### Database:
- `scripts/add-line-user-id.sql` - Migration สำหรับ LINE user ID
- `scripts/run-line-migration.js` - Helper script

#### Documentation:
- `docs/LINE_AUTH_SETUP.md` - Complete setup guide
- `docs/SETUP_COMPLETE.md` - This file
- `.env.example` - Environment template

## ขั้นตอนที่ต้องทำต่อ

### 📝 Step 1: รัน Database Migration

คัดลอก SQL นี้ไปรันใน [Supabase SQL Editor](https://supabase.com/dashboard/project/pdnxfckzwlnlqapotepl/sql):

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_customers_line_user_id ON customers(line_user_id);
```

### 🔧 Step 2: ตรวจสอบ LINE Developers Console

ไปที่ https://developers.line.biz/console/ และตรวจสอบว่า **Callback URL** ถูกเพิ่มแล้ว:

**ใน channel `2007773973` → LINE Login settings → Callback URL:**
```
http://localhost:3000/auth/callback
```

ถ้ายังไม่มี:
1. คลิก "Edit"
2. เพิ่ม `http://localhost:3000/auth/callback`
3. คลิก "Update"

### 🚀 Step 3: ทดสอบ Authentication Flow

1. **เริ่ม dev server:**
   ```bash
   npm run dev
   ```

2. **เปิดเบราว์เซอร์:**
   ```
   http://localhost:3000
   ```

3. **ทดสอบ flow:**
   - เลือก "เกษตรกร (Farmer)" หรือ "ผู้ให้บริการ (Provider)"
   - คลิก "เข้าสู่ระบบด้วย LINE"
   - Login ด้วย LINE account
   - ตรวจสอบว่า redirect ไปหน้า dashboard ถูกต้อง:
     - Farmer → `/farmer/dashboard`
     - Provider → `/provider/dashboard`

4. **ตรวจสอบข้อมูลใน Console:**
   ```javascript
   // ใน browser DevTools → Console
   console.log(localStorage.getItem('user'))
   console.log(localStorage.getItem('user_role'))
   console.log(document.cookie)
   ```

5. **ตรวจสอบใน Supabase:**
   - ไปที่ Table Editor → customers
   - ดู record ใหม่ที่ถูกสร้าง
   - ตรวจสอบ `line_user_id` ถูกบันทึก

## 🎯 Expected Results

### หน้า Landing (`/`)
- ✅ แสดง role selection cards
- ✅ เมื่อเลือก role → แสดงปุ่ม LINE Login
- ✅ คลิกปุ่ม → redirect ไป LINE OAuth

### หน้า Callback (`/auth/callback`)
- ✅ แสดง loading spinner
- ✅ Exchange code สำเร็จ
- ✅ สร้าง/อัพเดต user ใน Supabase
- ✅ ตั้ง cookies และ localStorage
- ✅ Redirect ไป dashboard

### Middleware
- ✅ ป้องกันเส้นทาง `/farmer/*` และ `/provider/*`
- ✅ Redirect ถ้าไม่มี authentication
- ✅ Redirect ถ้า role ไม่ตรงกับเส้นทาง

### Database
- ✅ สร้าง user record ใหม่ (ถ้ายังไม่มี)
- ✅ บันทึก LINE profile data
- ✅ ตั้ง role ตามที่เลือก

## 🔍 Troubleshooting

### 1. Error: "Invalid state parameter"
**สาเหตุ:** sessionStorage ถูกล้าง หรือ CSRF protection
**แก้ไข:** ลองใหม่, ล้าง cache และ cookies

### 2. Error: "Failed to exchange authorization code"
**สาเหตุ:** Channel Secret ผิด หรือ Callback URL ไม่ตรง
**แก้ไข:**
```bash
# ตรวจสอบ .env.local
cat .env.local | grep LINE

# ตรวจสอบ LINE Console
# Callback URL ต้องตรงกับ NEXT_PUBLIC_LINE_CALLBACK_URL
```

### 3. Error: "Failed to create user"
**สาเหตุ:** SQL migration ยังไม่รัน หรือ RLS blocking
**แก้ไข:**
1. รัน SQL migration (Step 1 ข้างบน)
2. ตรวจสอบ Service Role Key ใน API endpoint

### 4. Redirect loop หรือ 404
**สาเหตุ:** Middleware blocking
**แก้ไข:**
1. เช็ค cookies ถูกตั้งแล้ว: `document.cookie`
2. เช็ค middleware logs ใน terminal
3. ปิด middleware ชั่วคราว (comment `export const config`)

## 📚 เอกสารเพิ่มเติม

- **LINE Auth Complete Guide**: `docs/LINE_AUTH_SETUP.md`
- **Original LINE Setup**: `docs/LINE_SETUP_GUIDE.md`
- **API Documentation**: `AGRICONNECT_V2_README.md`
- **Quick Start**: `QUICKSTART.md`

## 🎉 Next Steps

หลังจากทดสอบสำเร็จแล้ว:

1. **เพิ่มหน้า Profile Setup** (สำหรับ user ที่ login ครั้งแรก)
2. **Logout Functionality**
3. **LINE Messaging API** (สำหรับส่งการแจ้งเตือน)
4. **Production Deployment** (Vercel)

---

**Setup Date**: 2025-10-02
**Status**: ✅ Ready for Testing
**By**: Claude Code
