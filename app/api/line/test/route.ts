import { NextResponse } from "next/server"

// Test endpoint to check if webhook is accessible
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "LINE webhook endpoint is working",
    timestamp: new Date().toISOString(),
    env: {
      hasChannelSecret: !!process.env.LINE_CHANNEL_SECRET,
      hasChannelAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    },
  })
}

export async function POST() {
  return NextResponse.json({
    status: "ok",
    message: "POST request received",
    timestamp: new Date().toISOString(),
  })
}
