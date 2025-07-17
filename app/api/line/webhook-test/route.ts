import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Test webhook with mock LINE data
export async function POST(request: NextRequest) {
  try {
    // Mock LINE webhook data
    const mockWebhookData = {
      destination: "test",
      events: [
        {
          type: "message",
          mode: "active",
          timestamp: Date.now(),
          source: {
            type: "user",
            userId: "test-user-id",
          },
          message: {
            id: "test-message-id",
            type: "text",
            text: "test message",
          },
          replyToken: "test-reply-token",
        },
      ],
    }

    const body = JSON.stringify(mockWebhookData)

    // Create test signature
    const channelSecret = process.env.LINE_CHANNEL_SECRET
    if (!channelSecret) {
      return NextResponse.json(
        {
          error: "LINE_CHANNEL_SECRET not configured",
          success: false,
        },
        { status: 500 },
      )
    }

    const signature = crypto.createHmac("sha256", channelSecret).update(body, "utf8").digest("base64")

    console.log("Test webhook with signature:", signature)

    // Test the actual webhook endpoint
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/line/webhook`

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-line-signature": signature,
      },
      body: body,
    })

    const result = await response.text()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: result,
      testData: {
        signature,
        body: mockWebhookData,
        webhookUrl,
      },
    })
  } catch (error) {
    console.error("Webhook test error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
