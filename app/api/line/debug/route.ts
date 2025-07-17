import { NextResponse } from "next/server"

// Debug endpoint to check configuration
export async function GET() {
  const config = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    lineConfig: {
      hasChannelSecret: !!process.env.LINE_CHANNEL_SECRET,
      channelSecretLength: process.env.LINE_CHANNEL_SECRET?.length || 0,
      hasChannelAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      accessTokenLength: process.env.LINE_CHANNEL_ACCESS_TOKEN?.length || 0,
      hasAdminUserId: !!process.env.ADMIN_LINE_USER_ID,
      adminUserIdLength: process.env.ADMIN_LINE_USER_ID?.length || 0,
    },
    urls: {
      baseUrl: "https://drone-booking-app.vercel.app",
      webhookUrl: "https://drone-booking-app.vercel.app/api/line/webhook",
      liffUrl: "https://drone-booking-app.vercel.app/line/liff/booking",
      hasLiffId: !!process.env.NEXT_PUBLIC_LIFF_ID,
    },
  }

  return NextResponse.json(config, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
