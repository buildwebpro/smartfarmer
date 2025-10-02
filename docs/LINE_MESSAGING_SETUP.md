# LINE Messaging API - Complete Setup Guide

## Overview

ระบบ LINE Messaging จะใช้สำหรับ:
- 🔔 ส่งการแจ้งเตือนให้ Farmer และ Provider
- 💬 แชทและติดต่อสื่อสาร
- 📋 Rich Menu สำหรับเข้าถึงฟีเจอร์ต่างๆ
- 🤖 Chatbot ตอบคำถามอัตโนมัติ

## 1. Setup LINE Messaging API Channel

### สร้าง Messaging API Channel

1. ไปที่ https://developers.line.biz/console/
2. เลือก Provider ที่มีอยู่แล้ว
3. คลิก **"Create a new channel"**
4. เลือก **"Messaging API"**
5. กรอกข้อมูล:
   - Channel name: `AgriConnect Bot`
   - Channel description: `Notification and support bot for AgriConnect`
   - Category: `Productivity`
   - Subcategory: `Business tools`
6. คลิก "Create"

### Configure Webhook

1. ไปที่แท็บ **"Messaging API"**
2. ตั้งค่า Webhook URL:
   ```
   https://your-domain.vercel.app/api/line/webhook
   ```
3. เปิด **"Use webhook"** = ON
4. เปิด **"Allow bot to join group chats"** = ON (optional)

### Get Channel Access Token

1. ไปที่ **"Messaging API"** tab
2. หาส่วน **"Channel access token"**
3. คลิก **"Issue"** เพื่อสร้าง token
4. คัดลอก token เก็บไว้

### Get Channel Secret

1. ไปที่ **"Basic settings"** tab
2. หา **"Channel secret"**
3. คลิก "Show" และคัดลอก

## 2. Environment Variables

เพิ่มใน `.env.local`:

```env
# LINE Messaging API
LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=your-channel-access-token
LINE_MESSAGING_CHANNEL_SECRET=your-channel-secret

# LINE Login (ถ้ามีอยู่แล้ว)
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=2007773973
LINE_LOGIN_CHANNEL_SECRET=efad6ca45c1dac3927f7979deefe053c
```

## 3. Rich Menu Design

### Farmer Rich Menu (6 ปุ่ม)

```
┌─────────────────────────────┐
│  จ้างงาน  │  งานของฉัน  │  แชท  │
├─────────────────────────────┤
│  ปฏิทิน   │  โปรไฟล์   │  ตั้งค่า │
└─────────────────────────────┘
```

**Actions:**
1. จ้างงาน → `/line/liff/post-job`
2. งานของฉัน → `/farmer/my-jobs`
3. แชท → `/farmer/messages`
4. ปฏิทิน → `/farmer/calendar`
5. โปรไฟล์ → `/farmer/profile`
6. ตั้งค่า → `/settings`

### Provider Rich Menu (6 ปุ่ม)

```
┌─────────────────────────────┐
│  หางาน   │  ข้อเสนอ   │  แชท  │
├─────────────────────────────┤
│  รายได้  │  โปรไฟล์   │  ตั้งค่า │
└─────────────────────────────┘
```

**Actions:**
1. หางาน → `/provider/browse-jobs`
2. ข้อเสนอ → `/provider/my-proposals`
3. แชท → `/provider/messages`
4. รายได้ → `/provider/earnings`
5. โปรไฟล์ → `/provider/profile`
6. ตั้งค่า → `/settings`

## 4. Rich Menu JSON

### Farmer Rich Menu

```json
{
  "size": {
    "width": 2500,
    "height": 1686
  },
  "selected": true,
  "name": "AgriConnect - Farmer Menu",
  "chatBarText": "เมนู",
  "areas": [
    {
      "bounds": { "x": 0, "y": 0, "width": 833, "height": 843 },
      "action": {
        "type": "uri",
        "uri": "https://your-domain.vercel.app/line/liff/post-job"
      }
    },
    {
      "bounds": { "x": 833, "y": 0, "width": 834, "height": 843 },
      "action": {
        "type": "uri",
        "uri": "https://your-domain.vercel.app/farmer/my-jobs"
      }
    },
    {
      "bounds": { "x": 1667, "y": 0, "width": 833, "height": 843 },
      "action": {
        "type": "uri",
        "uri": "https://your-domain.vercel.app/farmer/messages"
      }
    },
    {
      "bounds": { "x": 0, "y": 843, "width": 833, "height": 843 },
      "action": {
        "type": "uri",
        "uri": "https://your-domain.vercel.app/farmer/calendar"
      }
    },
    {
      "bounds": { "x": 833, "y": 843, "width": 834, "height": 843 },
      "action": {
        "type": "uri",
        "uri": "https://your-domain.vercel.app/farmer/profile"
      }
    },
    {
      "bounds": { "x": 1667, "y": 843, "width": 833, "height": 843 },
      "action": {
        "type": "uri",
        "uri": "https://your-domain.vercel.app/settings"
      }
    }
  ]
}
```

## 5. Notification Templates

### 1. New Proposal Notification (Farmer)

```javascript
{
  "type": "flex",
  "altText": "คุณมีข้อเสนองานใหม่!",
  "contents": {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "📬 ข้อเสนองานใหม่",
          "weight": "bold",
          "size": "xl",
          "color": "#16a34a"
        },
        {
          "type": "text",
          "text": "{provider_name} ส่งข้อเสนอให้คุณ",
          "margin": "md"
        },
        {
          "type": "box",
          "layout": "vertical",
          "margin": "lg",
          "spacing": "sm",
          "contents": [
            {
              "type": "box",
              "layout": "baseline",
              "contents": [
                { "type": "text", "text": "งาน:", "color": "#aaaaaa", "flex": 1 },
                { "type": "text", "text": "{job_title}", "wrap": true, "flex": 4 }
              ]
            },
            {
              "type": "box",
              "layout": "baseline",
              "contents": [
                { "type": "text", "text": "ราคา:", "color": "#aaaaaa", "flex": 1 },
                { "type": "text", "text": "{price} บาท", "color": "#16a34a", "flex": 4 }
              ]
            }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "button",
          "action": {
            "type": "uri",
            "label": "ดูรายละเอียด",
            "uri": "https://your-domain.vercel.app/farmer/my-jobs/{job_id}"
          },
          "style": "primary",
          "color": "#16a34a"
        }
      ]
    }
  }
}
```

### 2. Job Accepted Notification (Provider)

```javascript
{
  "type": "flex",
  "altText": "🎉 ข้อเสนอของคุณได้รับการยอมรับ!",
  "contents": {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "🎉 ยอมรับข้อเสนอแล้ว!",
          "weight": "bold",
          "size": "xl",
          "color": "#16a34a"
        },
        {
          "type": "text",
          "text": "เกษตรกรยอมรับข้อเสนอของคุณ",
          "margin": "md"
        },
        {
          "type": "box",
          "layout": "vertical",
          "margin": "lg",
          "spacing": "sm",
          "contents": [
            {
              "type": "box",
              "layout": "baseline",
              "contents": [
                { "type": "text", "text": "งาน:", "color": "#aaaaaa", "flex": 1 },
                { "type": "text", "text": "{job_title}", "wrap": true, "flex": 4 }
              ]
            },
            {
              "type": "box",
              "layout": "baseline",
              "contents": [
                { "type": "text", "text": "วันที่:", "color": "#aaaaaa", "flex": 1 },
                { "type": "text", "text": "{date}", "flex": 4 }
              ]
            },
            {
              "type": "box",
              "layout": "baseline",
              "contents": [
                { "type": "text", "text": "ราคา:", "color": "#aaaaaa", "flex": 1 },
                { "type": "text", "text": "{price} บาท", "color": "#16a34a", "flex": 4 }
              ]
            }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "button",
          "action": {
            "type": "uri",
            "label": "ดูรายละเอียดงาน",
            "uri": "https://your-domain.vercel.app/provider/my-proposals/{proposal_id}"
          },
          "style": "primary"
        }
      ]
    }
  }
}
```

### 3. Job Completed Notification

```javascript
{
  "type": "flex",
  "altText": "งานเสร็จสมบูรณ์แล้ว!",
  "contents": {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "✅ งานเสร็จสมบูรณ์",
          "weight": "bold",
          "size": "xl",
          "color": "#16a34a"
        },
        {
          "type": "text",
          "text": "ขอบคุณที่ใช้บริการ AgriConnect",
          "margin": "md"
        },
        {
          "type": "box",
          "layout": "vertical",
          "margin": "lg",
          "spacing": "sm",
          "contents": [
            {
              "type": "text",
              "text": "กรุณาให้คะแนนและรีวิวผู้ให้บริการ",
              "color": "#666666"
            }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "button",
          "action": {
            "type": "uri",
            "label": "ให้คะแนนและรีวิว",
            "uri": "https://your-domain.vercel.app/review/{job_id}"
          },
          "style": "primary",
          "color": "#16a34a"
        }
      ]
    }
  }
}
```

## 6. Webhook Handler

สร้างไฟล์ `app/api/line/webhook/route.ts`

## 7. การใช้งาน

### ส่งการแจ้งเตือนแบบ Push Message

```typescript
// lib/line/messaging.ts
import { Client } from '@line/bot-sdk'

const client = new Client({
  channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_MESSAGING_CHANNEL_SECRET!
})

export async function sendNewProposalNotification(
  farmerLineUserId: string,
  data: {
    providerName: string
    jobTitle: string
    price: number
    jobId: string
  }
) {
  const message = {
    type: 'flex',
    altText: 'คุณมีข้อเสนองานใหม่!',
    contents: {
      // ... Flex Message template
    }
  }

  await client.pushMessage(farmerLineUserId, message)
}
```

### ตั้งค่า Rich Menu ตาม Role

```typescript
export async function setRichMenuByRole(lineUserId: string, role: 'farmer' | 'provider') {
  const richMenuId = role === 'farmer'
    ? process.env.LINE_RICH_MENU_FARMER_ID
    : process.env.LINE_RICH_MENU_PROVIDER_ID

  await client.linkRichMenuToUser(lineUserId, richMenuId!)
}
```

## 8. Testing

### Test Push Message

```bash
curl -X POST https://api.line.me/v2/bot/message/push \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {CHANNEL_ACCESS_TOKEN}' \
  -d '{
    "to": "U1234567890abcdef",
    "messages": [{
      "type": "text",
      "text": "Test notification from AgriConnect"
    }]
  }'
```

## 9. Events & Triggers

### เมื่อมี Proposal ใหม่
→ ส่งการแจ้งเตือนให้ Farmer

### เมื่อยอมรับ Proposal
→ ส่งการแจ้งเตือนให้ Provider

### เมื่องานเสร็จสมบูรณ์
→ ส่งการแจ้งเตือนให้ทั้ง Farmer และ Provider

### เมื่อ Farmer login ครั้งแรก
→ ตั้งค่า Rich Menu สำหรับ Farmer

### เมื่อ Provider login ครั้งแรก
→ ตั้งค่า Rich Menu สำหรับ Provider

---

**Next Steps:**
1. สร้าง Rich Menu images (2500x1686px)
2. Upload Rich Menu ผ่าน LINE Console
3. สร้าง Webhook handler
4. ทดสอบส่งการแจ้งเตือน
