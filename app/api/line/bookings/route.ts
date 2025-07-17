import { type NextRequest, NextResponse } from "next/server"

interface BookingData {
  customerName: string
  phoneNumber: string
  areaSize: string
  cropType: string
  sprayType: string
  gpsCoordinates: string
  selectedDate: string | null
  selectedTime: string
  notes: string
  lineUserId: string
  totalPrice: number
  depositAmount: number
  status: string
  createdAt: string
}

// Mock database - in production, use a real database
const bookings: (BookingData & { id: string })[] = []

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json()

    // Validate required fields
    if (!bookingData.customerName || !bookingData.phoneNumber || !bookingData.areaSize) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    // Generate booking ID
    const bookingId = `LN${Date.now()}`

    // Create booking record
    const newBooking = {
      id: bookingId,
      ...bookingData,
      createdAt: new Date().toISOString(),
    }

    // Save to mock database
    bookings.push(newBooking)

    // Send notification to admin via LINE Messaging API
    await notifyAdminViaLine(newBooking)

    return NextResponse.json({
      success: true,
      bookingId,
      message: "การจองสำเร็จ",
      data: newBooking,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 })
  }
}

async function notifyAdminViaLine(booking: BookingData & { id: string }) {
  const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const ADMIN_LINE_USER_ID = process.env.ADMIN_LINE_USER_ID // Admin's LINE User ID

  if (!LINE_CHANNEL_ACCESS_TOKEN || !ADMIN_LINE_USER_ID) {
    console.log("LINE credentials not configured")
    return
  }

  const message = {
    type: "flex",
    altText: "มีการจองใหม่!",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🚁 การจองใหม่!",
            weight: "bold",
            color: "#1DB446",
            size: "lg",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: "รหัส:",
                size: "sm",
                color: "#666666",
                flex: 2,
              },
              {
                type: "text",
                text: booking.id,
                size: "sm",
                color: "#111111",
                flex: 5,
                weight: "bold",
              },
            ],
          },
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: "ลูกค้า:",
                size: "sm",
                color: "#666666",
                flex: 2,
              },
              {
                type: "text",
                text: booking.customerName,
                size: "sm",
                color: "#111111",
                flex: 5,
              },
            ],
          },
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: "เบอร์:",
                size: "sm",
                color: "#666666",
                flex: 2,
              },
              {
                type: "text",
                text: booking.phoneNumber,
                size: "sm",
                color: "#111111",
                flex: 5,
              },
            ],
          },
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: "พื้นที่:",
                size: "sm",
                color: "#666666",
                flex: 2,
              },
              {
                type: "text",
                text: `${booking.areaSize} ไร่`,
                size: "sm",
                color: "#111111",
                flex: 5,
              },
            ],
          },
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: "ราคา:",
                size: "sm",
                color: "#666666",
                flex: 2,
              },
              {
                type: "text",
                text: `${booking.totalPrice.toLocaleString()} บาท`,
                size: "sm",
                color: "#111111",
                flex: 5,
                weight: "bold",
              },
            ],
          },
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: "มัดจำ:",
                size: "sm",
                color: "#666666",
                flex: 2,
              },
              {
                type: "text",
                text: `${booking.depositAmount.toLocaleString()} บาท`,
                size: "sm",
                color: "#1DB446",
                flex: 5,
                weight: "bold",
              },
            ],
          },
        ],
        spacing: "sm",
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
              label: "ดูในระบบ Admin",
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders`,
            },
          },
        ],
      },
    },
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: ADMIN_LINE_USER_ID,
        messages: [message],
      }),
    })

    if (!response.ok) {
      console.error("Failed to send LINE message:", await response.text())
    }
  } catch (error) {
    console.error("Error sending LINE message:", error)
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: bookings,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}
