import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// LINE Webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-line-signature")

    console.log("Webhook received:", {
      hasSignature: !!signature,
      bodyLength: body.length,
      hasChannelSecret: !!process.env.LINE_CHANNEL_SECRET,
    })

    // Verify LINE signature
    if (!verifySignature(body, signature)) {
      console.error("Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const events = JSON.parse(body).events || []
    console.log("Events received:", events.length)

    for (const event of events) {
      console.log("Processing event:", event.type)

      if (event.type === "message" && event.message.type === "text") {
        const userId = event.source.userId
        const messageText = event.message.text.toLowerCase()

        console.log("Message from user:", userId, "text:", messageText)

        // Handle different commands
        if (messageText.includes("จอง") || messageText.includes("booking")) {
          await handleBookingRequest(userId)
        } else if (messageText.includes("สถานะ") || messageText.includes("status")) {
          await handleStatusRequest(userId)
        } else if (messageText.includes("ราคา") || messageText.includes("price")) {
          await handlePriceRequest(userId)
        } else if (messageText.includes("ช่วยเหลือ") || messageText.includes("help")) {
          await sendHelpMessage(userId)
        } else {
          await sendWelcomeMessage(userId)
        }
      } else if (event.type === "follow") {
        // User added bot as friend
        console.log("New follower:", event.source.userId)
        await sendWelcomeMessage(event.source.userId)
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("LINE Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle GET request for webhook verification
export async function GET(request: NextRequest) {
  console.log("GET request to webhook - this might be LINE verification")
  return NextResponse.json({ status: "ok", message: "Webhook endpoint is working" })
}

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) {
    console.error("No signature provided")
    return false
  }

  const channelSecret = process.env.LINE_CHANNEL_SECRET
  if (!channelSecret) {
    console.error("LINE_CHANNEL_SECRET not configured")
    return false
  }

  try {
    const hash = crypto.createHmac("sha256", channelSecret).update(body, "utf8").digest("base64")

    const isValid = hash === signature
    console.log("Signature verification:", { isValid, expectedHash: hash, receivedSignature: signature })

    return isValid
  } catch (error) {
    console.error("Error verifying signature:", error)
    return false
  }
}

async function handleBookingRequest(userId: string) {
  const liffUrl = `https://drone-booking-app.vercel.app/line/liff/booking`

  await sendLineMessage(userId, {
    type: "flex",
    altText: "จองบริการพ่นยาโดรน",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🚁 จองบริการพ่นยาโดรน",
            weight: "bold",
            size: "lg",
            color: "#1DB446",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "บริการพ่นยาด้วยโดรนที่ทันสมัย รวดเร็ว และมีประสิทธิภาพ",
            wrap: true,
            size: "sm",
            color: "#666666",
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "✅ โดรน 6 ลำพร้อมให้บริการ",
                size: "sm",
              },
              {
                type: "text",
                text: "✅ นักบินมืออาชีพ",
                size: "sm",
              },
              {
                type: "text",
                text: "✅ ราคาเริ่มต้น 50 บาท/ไร่",
                size: "sm",
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "uri",
              label: "เริ่มจองบริการ",
              uri: liffUrl,
            },
          },
          {
            type: "button",
            style: "secondary",
            height: "sm",
            action: {
              type: "message",
              label: "ดูราคาบริการ",
              text: "ราคา",
            },
          },
        ],
        spacing: "sm",
      },
    },
  })
}

async function handleStatusRequest(userId: string) {
  await sendLineMessage(userId, {
    type: "text",
    text: "🔍 กำลังตรวจสอบสถานะการจองของคุณ...\n\nหากยังไม่มีการจอง กรุณาพิมพ์ 'จองบริการ' เพื่อเริ่มจองครับ",
  })
}

async function handlePriceRequest(userId: string) {
  await sendLineMessage(userId, {
    type: "flex",
    altText: "ราคาบริการพ่นยาโดรน",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "💰 ราคาบริการ",
            weight: "bold",
            size: "lg",
            color: "#1DB446",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🌾 ชนิดพืช",
            weight: "bold",
            size: "md",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "• ข้าว",
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: "50 บาท/ไร่",
                    size: "sm",
                    flex: 2,
                    align: "end",
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "• อ้อย",
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: "70 บาท/ไร่",
                    size: "sm",
                    flex: 2,
                    align: "end",
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "• ทุเรียน",
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: "100 บาท/ไร่",
                    size: "sm",
                    flex: 2,
                    align: "end",
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "• มันสำปะหลัง",
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: "70 บาท/ไร่",
                    size: "sm",
                    flex: 2,
                    align: "end",
                  },
                ],
              },
            ],
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "text",
            text: "🧪 ชนิดสารพ่น",
            weight: "bold",
            size: "md",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "• ปุ๋ย",
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: "100 บาท/ไร่",
                    size: "sm",
                    flex: 2,
                    align: "end",
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "• ฮอร์โมน",
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: "150 บาท/ไร่",
                    size: "sm",
                    flex: 2,
                    align: "end",
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "• ยาฆ่าหญ้า",
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: "200 บาท/ไร่",
                    size: "sm",
                    flex: 2,
                    align: "end",
                  },
                ],
              },
            ],
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "text",
            text: "📝 ราคารวม = (ราคาพืช + ราคาสาร) × จำนวนไร่\nมัดจำ 30% ของราคารวม",
            size: "xs",
            color: "#666666",
            wrap: true,
            margin: "md",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "message",
              label: "จองบริการ",
              text: "จองบริการ",
            },
          },
        ],
      },
    },
  })
}

async function sendWelcomeMessage(userId: string) {
  await sendLineMessage(userId, {
    type: "flex",
    altText: "ยินดีต้อนรับสู่บริการพ่นยาโดรน",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🚁 ยินดีต้อนรับ",
            weight: "bold",
            size: "lg",
            color: "#1DB446",
          },
          {
            type: "text",
            text: "บริการพ่นยาโดรน",
            size: "md",
            color: "#666666",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "คำสั่งที่ใช้ได้:",
            weight: "bold",
            size: "sm",
          },
          {
            type: "text",
            text: "• พิมพ์ 'จองบริการ' - เริ่มจองบริการ\n• พิมพ์ 'สถานะ' - ตรวจสอบสถานะ\n• พิมพ์ 'ราคา' - ดูราคาบริการ\n• พิมพ์ 'ช่วยเหลือ' - ดูคำแนะนำ",
            size: "sm",
            wrap: true,
            margin: "md",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "message",
              label: "เริ่มจองบริการ",
              text: "จองบริการ",
            },
          },
        ],
      },
    },
  })
}

async function sendHelpMessage(userId: string) {
  await sendLineMessage(userId, {
    type: "text",
    text: `🆘 ช่วยเหลือ\n\nคำสั่งที่ใช้ได้:\n• "จองบริการ" - เริ่มจองบริการ\n• "สถานะ" - ตรวจสอบสถานะการจอง\n• "ราคา" - ดูราคาบริการ\n• "ช่วยเหลือ" - ดูคำแนะนำนี้\n\nหรือใช้เมนูด้านล่างได้เลยครับ\n\n📞 ติดต่อ: 02-xxx-xxxx`,
  })
}

async function sendLineMessage(userId: string, message: any) {
  const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    console.error("LINE_CHANNEL_ACCESS_TOKEN not configured")
    return
  }

  try {
    console.log("Sending message to user:", userId)

    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [message],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to send LINE message:", response.status, errorText)
    } else {
      console.log("Message sent successfully")
    }
  } catch (error) {
    console.error("Error sending LINE message:", error)
  }
}
