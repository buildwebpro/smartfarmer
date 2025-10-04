import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { supabase } from "@/lib/supabaseClient"
import { getAIResponse, shouldUseAI } from "@/lib/gemini/ai-helper"

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
        const messageText = event.message.text
        const lowerMessage = messageText.toLowerCase()

        console.log("Message from user:", userId, "text:", messageText)

        // Handle different commands
        if (lowerMessage.includes("จองโดรน") || lowerMessage.includes("พ่นยา")) {
          await handleDroneBookingRequest(userId)
        } else if (lowerMessage.includes("เช่าเครื่อง") || lowerMessage.includes("เครื่องจักร")) {
          await handleEquipmentRentalRequest(userId)
        } else if (lowerMessage.includes("ประวัติ") || lowerMessage.includes("รายการจอง")) {
          await handleMyBookingsRequest(userId)
        } else if (lowerMessage.includes("สถานะ") || lowerMessage.includes("ตรวจสอบ")) {
          await handleStatusRequest(userId)
        } else if (lowerMessage.includes("ราคา") || lowerMessage.includes("price")) {
          await handlePriceRequest(userId)
        } else if (lowerMessage.includes("ช่วยเหลือ") || lowerMessage.includes("help")) {
          await sendHelpMessage(userId)
        } else if (shouldUseAI(messageText)) {
          // ใช้ AI ตอบคำถามทั่วไป
          await handleAIResponse(userId, messageText)
        } else {
          await sendWelcomeMessage(userId)
        }
      } else if (event.type === "follow") {
        // User added bot as friend
        console.log("New follower:", event.source.userId)
        await sendWelcomeMessage(event.source.userId)
        // อาจจะผูก Rich Menu ให้อัตโนมัติ
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
    console.log("Signature verification:", { isValid })
    return isValid
  } catch (error) {
    console.error("Error verifying signature:", error)
    return false
  }
}

// จองบริการโดรนพ่นยา
async function handleDroneBookingRequest(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const liffUrl = `${baseUrl}/line/liff/booking`

  await sendLineMessage(userId, {
    type: "flex",
    altText: "จองบริการพ่นยาโดรน",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://via.placeholder.com/800x400/1DB446/FFFFFF?text=%F0%9F%9A%81+Drone+Service",
        size: "full",
        aspectRatio: "20:13",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🚁 บริการพ่นยาโดรน",
            weight: "bold",
            size: "xl",
            color: "#1DB446",
          },
          {
            type: "text",
            text: "บริการพ่นยาด้วยโดรนที่ทันสมัย รวดเร็ว และมีประสิทธิภาพ",
            wrap: true,
            size: "sm",
            color: "#666666",
            margin: "md",
          },
          {
            type: "separator",
            margin: "xl",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "✅", size: "sm", flex: 0 },
                  { type: "text", text: "โดรนพร้อมให้บริการ 6 ลำ", size: "sm", color: "#555555", margin: "sm" },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "✅", size: "sm", flex: 0 },
                  { type: "text", text: "นักบินมืออาชีพมีใบอนุญาต", size: "sm", color: "#555555", margin: "sm" },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "💰", size: "sm", flex: 0 },
                  { type: "text", text: "ราคาเริ่มต้น 300 บาท/ไร่", size: "sm", color: "#111111", weight: "bold", margin: "sm" },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#1DB446",
            action: {
              type: "uri",
              label: "📱 เริ่มจองบริการ",
              uri: liffUrl,
            },
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "message",
              label: "💰 ดูราคาบริการ",
              text: "ราคา",
            },
          },
        ],
      },
    },
  })
}

// เช่าเครื่องจักรเกษตร
async function handleEquipmentRentalRequest(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  // ดึงข้อมูลเครื่องจักรที่พร้อมให้เช่า (เพิ่มเป็น 6 รายการ)
  const { data: equipment } = await supabase
    .from("equipment")
    .select("name, model, rental_price_per_day, deposit_amount, category:equipment_categories(name)")
    .eq("is_active", true)
    .eq("status", "available")
    .limit(6)

  const equipmentList = equipment?.map(e => ({
    type: "box",
    layout: "vertical",
    spacing: "xs",
    margin: "md",
    contents: [
      {
        type: "box",
        layout: "baseline",
        contents: [
          { type: "text", text: "🚜", size: "sm", flex: 0 },
          {
            type: "text",
            text: e.name,
            size: "sm",
            weight: "bold",
            color: "#1DB446",
            margin: "sm",
            wrap: true,
            flex: 1,
          },
        ],
      },
      {
        type: "box",
        layout: "baseline",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: `${e.model || '-'}`,
            size: "xs",
            color: "#999999",
            margin: "sm",
            wrap: true,
          },
        ],
      },
      {
        type: "box",
        layout: "baseline",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: `💰 ${e.rental_price_per_day?.toLocaleString()} บาท/วัน | มัดจำ ${e.deposit_amount?.toLocaleString()} บาท`,
            size: "xs",
            color: "#555555",
            margin: "sm",
            wrap: true,
          },
        ],
      },
    ],
  })) || []

  await sendLineMessage(userId, {
    type: "flex",
    altText: "เช่าเครื่องจักรเกษตร",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🚜 เช่าเครื่องจักรเกษตร",
            weight: "bold",
            size: "xl",
            color: "#1DB446",
          },
          {
            type: "text",
            text: `เครื่องจักรคุณภาพดี พร้อมให้บริการ ${equipment?.length || 0} รายการ`,
            size: "sm",
            color: "#666666",
            margin: "md",
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: equipmentList.length > 0 ? equipmentList : [
              {
                type: "text",
                text: "ขออภัย ขณะนี้ไม่มีเครื่องจักรพร้อมให้เช่า",
                size: "sm",
                color: "#999999",
                align: "center",
              }
            ],
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "xs",
            contents: [
              {
                type: "text",
                text: "💡 สนใจเช่าเครื่องจักร",
                size: "xs",
                color: "#666666",
              },
              {
                type: "text",
                text: "กดปุ่มด้านล่างเพื่อจองเครื่องจักรที่ต้องการได้เลย",
                size: "xs",
                color: "#999999",
                wrap: true,
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "xs",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#1DB446",
            action: {
              type: "uri",
              label: "🚜 เช่าเครื่องจักร",
              uri: `${baseUrl}/line/liff/booking`,
            },
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "message",
              label: "💰 ดูราคาบริการ",
              text: "ราคา",
            },
          },
        ],
      },
    },
  })
}

// ดูประวัติการจอง
async function handleMyBookingsRequest(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const liffUrl = `${baseUrl}/line/liff/my-bookings`

  await sendLineMessage(userId, {
    type: "flex",
    altText: "ประวัติการจอง",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📋 ประวัติการจอง",
            weight: "bold",
            size: "xl",
            color: "#1DB446",
          },
          {
            type: "text",
            text: "ดูรายการจองและสถานะของคุณ",
            size: "sm",
            color: "#666666",
            margin: "md",
            wrap: true,
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
            color: "#1DB446",
            action: {
              type: "uri",
              label: "📱 เปิดดูประวัติ",
              uri: liffUrl,
            },
          },
        ],
      },
    },
  })
}

// ตรวจสอบสถานะ
async function handleStatusRequest(userId: string) {
  // ค้นหาการจองล่าสุด
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("line_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)

  if (!bookings || bookings.length === 0) {
    await sendLineMessage(userId, {
      type: "text",
      text: "🔍 ไม่พบประวัติการจอง\n\nกรุณาจองบริการก่อนเพื่อดูสถานะครับ",
    })
    return
  }

  const booking = bookings[0]
  const statusMap: Record<string, string> = {
    pending_payment: "⏳ รอชำระเงิน",
    paid: "✅ ชำระเงินแล้ว",
    assigned: "👨‍✈️ มอบหมายงานแล้ว",
    in_progress: "🚁 กำลังดำเนินการ",
    completed: "✨ เสร็จสิ้น",
    cancelled: "❌ ยกเลิก",
  }

  await sendLineMessage(userId, {
    type: "flex",
    altText: "สถานะการจอง",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📊 สถานะการจองล่าสุด",
            weight: "bold",
            size: "lg",
            color: "#1DB446",
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "รหัสจอง:", size: "sm", color: "#aaaaaa", flex: 2 },
                  { type: "text", text: booking.booking_code, size: "sm", color: "#666666", flex: 3, wrap: true },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "สถานะ:", size: "sm", color: "#aaaaaa", flex: 2 },
                  { type: "text", text: statusMap[booking.status] || booking.status, size: "sm", color: "#111111", weight: "bold", flex: 3 },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "ยอดรวม:", size: "sm", color: "#aaaaaa", flex: 2 },
                  { type: "text", text: `${booking.total_price?.toLocaleString()} บาท`, size: "sm", color: "#666666", flex: 3 },
                ],
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
            style: "link",
            height: "sm",
            action: {
              type: "message",
              label: "ดูประวัติทั้งหมด",
              text: "ประวัติการจอง",
            },
          },
        ],
      },
    },
  })
}

// ดูราคา - ดึงข้อมูลจริงจากฐานข้อมูล
async function handlePriceRequest(userId: string) {
  const { data: cropTypes } = await supabase
    .from("crop_types")
    .select("name, price_per_rai")
    .eq("is_active", true)
    .order("name")

  const { data: sprayTypes } = await supabase
    .from("spray_types")
    .select("name, price_per_rai")
    .eq("is_active", true)
    .order("name")

  const cropContents = cropTypes?.map(crop => ({
    type: "box",
    layout: "baseline",
    contents: [
      { type: "text", text: `• ${crop.name}`, size: "sm", flex: 3 },
      { type: "text", text: `${crop.price_per_rai} บาท/ไร่`, size: "sm", flex: 2, align: "end" as const },
    ],
  })) || []

  const sprayContents = sprayTypes?.map(spray => ({
    type: "box",
    layout: "baseline",
    contents: [
      { type: "text", text: `• ${spray.name}`, size: "sm", flex: 3 },
      { type: "text", text: `${spray.price_per_rai} บาท/ไร่`, size: "sm", flex: 2, align: "end" as const },
    ],
  })) || []

  await sendLineMessage(userId, {
    type: "flex",
    altText: "ราคาบริการ",
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
            size: "xl",
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
            text: "🌾 ราคาตามชนิดพืช",
            weight: "bold",
            size: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: cropContents,
          },
          {
            type: "separator",
            margin: "xl",
          },
          {
            type: "text",
            text: "🧪 ราคาตามชนิดสารพ่น",
            weight: "bold",
            size: "md",
            margin: "xl",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: sprayContents,
          },
          {
            type: "separator",
            margin: "xl",
          },
          {
            type: "text",
            text: "📝 ราคารวม = (ราคาพืช + ราคาสาร) × จำนวนไร่\n💵 มัดจำ 30%",
            size: "xs",
            color: "#666666",
            wrap: true,
            margin: "lg",
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
            color: "#1DB446",
            action: {
              type: "message",
              label: "จองบริการเลย",
              text: "จองโดรน",
            },
          },
        ],
      },
    },
  })
}

// ใช้ AI ตอบคำถาม
async function handleAIResponse(userId: string, message: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    const aiResponse = await getAIResponse(message)

    await sendLineMessage(userId, {
      type: "flex",
      altText: "คำตอบจาก AI Assistant",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🤖 AI Assistant",
              weight: "bold",
              size: "lg",
              color: "#1DB446",
            },
            {
              type: "separator",
              margin: "md",
            },
            {
              type: "text",
              text: aiResponse,
              wrap: true,
              size: "sm",
              color: "#333333",
              margin: "md",
            },
            {
              type: "separator",
              margin: "lg",
            },
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: "💡 คำถามที่ถามได้:",
                  weight: "bold",
                  size: "xs",
                  color: "#666666",
                },
                {
                  type: "text",
                  text: "• โดรนพ่นยาข้าวควรใช้สารอะไร\n• ค่าบริการคำนวณยังไง\n• มีเครื่องไถให้เช่าไหม\n• ต้องจองล่วงหน้ากี่วัน",
                  size: "xs",
                  color: "#999999",
                  wrap: true,
                },
              ],
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: [
            {
              type: "button",
              style: "primary",
              height: "sm",
              color: "#1DB446",
              action: {
                type: "uri",
                label: "🚁 จองบริการ",
                uri: `${baseUrl}/line/liff/booking`,
              },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "message",
                label: "💰 ดูราคา",
                text: "ราคา",
              },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "message",
                label: "❓ ช่วยเหลือ",
                text: "ช่วยเหลือ",
              },
            },
          ],
        },
      },
    })
  } catch (error) {
    console.error("AI Response error:", error)

    // แสดงข้อความที่เป็นมิตรพร้อมทางเลือกอื่น
    await sendLineMessage(userId, {
      type: "flex",
      altText: "ขออภัย ไม่สามารถตอบคำถามได้",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "😊 ขออภัยค่ะ",
              weight: "bold",
              size: "lg",
              color: "#FF6B6B",
            },
            {
              type: "separator",
              margin: "md",
            },
            {
              type: "text",
              text: "ตอนนี้ระบบไม่สามารถตอบคำถามนี้ได้ กรุณาลองใหม่อีกครั้ง หรือเลือกบริการด้านล่างได้เลยค่ะ",
              wrap: true,
              size: "sm",
              color: "#555555",
              margin: "md",
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: [
            {
              type: "button",
              style: "primary",
              height: "sm",
              color: "#1DB446",
              action: {
                type: "uri",
                label: "🚁 จองบริการโดรน",
                uri: `${baseUrl}/line/liff/booking`,
              },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "message",
                label: "🚜 เช่าเครื่องจักร",
                text: "เช่าเครื่องจักร",
              },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "message",
                label: "💰 ดูราคา",
                text: "ราคา",
              },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "message",
                label: "❓ ช่วยเหลือ",
                text: "ช่วยเหลือ",
              },
            },
          ],
        },
      },
    })
  }
}

async function sendWelcomeMessage(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  await sendLineMessage(userId, {
    type: "flex",
    altText: "ยินดีต้อนรับ",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://via.placeholder.com/800x400/1DB446/FFFFFF?text=Welcome",
        size: "full",
        aspectRatio: "20:10",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🌾 พระพิรุนทร์ เซอร์วิส",
            weight: "bold",
            size: "xl",
            color: "#1DB446",
          },
          {
            type: "text",
            text: "บริการด้านเกษตรครบวงจร",
            size: "md",
            color: "#666666",
            margin: "sm",
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "📱 บริการของเรา:",
                weight: "bold",
                size: "sm",
              },
              {
                type: "text",
                text: "🚁 พ่นยาโดรน - รวดเร็ว ทันสมัย\n🚜 เช่าเครื่องจักร - คุณภาพดี\n📊 ตรวจสอบสถานะ - สะดวก",
                size: "sm",
                wrap: true,
                color: "#555555",
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#1DB446",
            action: {
              type: "uri",
              label: "🚁 จองพ่นยาโดรน",
              uri: `${baseUrl}/line/liff/booking`,
            },
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "message",
              label: "🚜 เช่าเครื่องจักร",
              text: "เช่าเครื่องจักร",
            },
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "message",
              label: "🤖 ถาม AI",
              text: "สอบถามข้อมูล",
            },
          },
        ],
      },
    },
  })

  // ส่งข้อความเสริมด้วยคำแนะนำการใช้งาน
  await sendLineMessage(userId, {
    type: "text",
    text: "💬 คุณสามารถถามคำถามอะไรก็ได้เกี่ยวกับบริการของเรา เช่น:\n\n• \"โดรนพ่นยาข้าวควรใช้สารอะไร\"\n• \"ค่าบริการคำนวณยังไง\"\n• \"มีเครื่องไถให้เช่าไหม\"\n• \"ช่วงไหนเหมาะสมพ่นยาข้าวโพด\"\n\nหรือใช้คำสั่งด่วน:\n📱 พิมพ์ \"ราคา\" - ดูราคาบริการ\n📊 พิมพ์ \"สถานะ\" - ตรวจสอบการจอง\n❓ พิมพ์ \"ช่วยเหลือ\" - ดูเมนูทั้งหมด",
  })
}

async function sendHelpMessage(userId: string) {
  await sendLineMessage(userId, {
    type: "flex",
    altText: "ช่วยเหลือ",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🆘 วิธีใช้งาน",
            weight: "bold",
            size: "xl",
            color: "#1DB446",
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "📝 คำสั่งที่ใช้ได้:",
                weight: "bold",
                size: "sm",
              },
              {
                type: "text",
                text: "🚁 จองโดรน - จองบริการพ่นยา\n🚜 เช่าเครื่องจักร - เช่าอุปกรณ์\n📊 ประวัติการจอง - ดูรายการ\n✅ สถานะ - ตรวจสอบสถานะ\n💰 ราคา - ดูราคาบริการ",
                size: "sm",
                wrap: true,
                color: "#555555",
                margin: "md",
              },
            ],
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "🤖 ถาม AI Assistant:",
                weight: "bold",
                size: "sm",
              },
              {
                type: "text",
                text: "• โดรนพ่นยาข้าวควรใช้สารอะไร\n• ค่าบริการคำนวณยังไง\n• มีเครื่องไถให้เช่าไหม\n• พ่นยาข้าวโพดควรช่วงไหน\n• ต้องจองล่วงหน้ากี่วัน",
                size: "xs",
                wrap: true,
                color: "#666666",
                margin: "sm",
              },
            ],
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            contents: [
              {
                type: "text",
                text: "📞 ติดต่อเจ้าหน้าที่:",
                weight: "bold",
                size: "sm",
              },
              {
                type: "text",
                text: "โทร: 02-xxx-xxxx\nเวลา: 08:00-18:00 น.",
                size: "sm",
                color: "#555555",
                margin: "sm",
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "xs",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#1DB446",
            action: {
              type: "message",
              label: "🤖 ถาม AI",
              text: "สอบถามข้อมูล",
            },
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "message",
              label: "💰 ดูราคา",
              text: "ราคา",
            },
          },
        ],
      },
    },
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
