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
    const bookingId = `BK${Date.now()}`

    // Create booking record
    const newBooking = {
      id: bookingId,
      ...bookingData,
      createdAt: new Date().toISOString(),
    }

    // Save to mock database
    bookings.push(newBooking)

    // In production, you would:
    // 1. Save to database (Supabase/Firebase)
    // 2. Send LINE notification to customer
    // 3. Generate QR code for payment
    // 4. Send notification to admin

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
