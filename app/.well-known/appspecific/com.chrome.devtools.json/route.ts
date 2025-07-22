import { NextResponse } from 'next/server'

export async function GET() {
  // Response for Chrome DevTools well-known request
  return NextResponse.json(
    {
      origins: ["*"],
      delegates: []
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      }
    }
  )
}
