import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth, forbiddenResponse } from "@/lib/auth-helpers"

// Debug endpoint to check configuration (Admin only)
export async function GET(request: NextRequest) {
  // ตรวจสอบสิทธิ์ admin
  const user = await verifyAdminAuth(request)
  if (!user) {
    return forbiddenResponse("Admin access required")
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://drone-booking-app.vercel.app"

  const config = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    lineConfig: {
      hasChannelSecret: !!process.env.LINE_CHANNEL_SECRET,
      hasChannelAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasAdminUserId: !!process.env.ADMIN_LINE_USER_ID,
      hasLiffId: !!process.env.NEXT_PUBLIC_LIFF_ID,
    },
    urls: {
      baseUrl,
      webhookUrl: `${baseUrl}/api/line/webhook`,
      liffUrl: `${baseUrl}/line/liff/booking`,
    },
  }

  return NextResponse.json(config, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
