import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

interface BookingData {
  customerName: string
  phoneNumber: string
  areaSize: string
  cropType: string
  sprayType: string
  gpsCoordinates: string
  selectedDate: string | null
  notes: string
  totalPrice: number
  depositAmount: number
  status: string
  createdAt: string
  lineUserId: string
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json()

    // Validate required fields
    if (!bookingData.customerName || !bookingData.phoneNumber || !bookingData.areaSize) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    // Insert to Supabase
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          customer_name: bookingData.customerName,
          phone_number: bookingData.phoneNumber,
          area_size: bookingData.areaSize,
          crop_type: bookingData.cropType,
          spray_type: bookingData.sprayType,
          gps_coordinates: bookingData.gpsCoordinates,
          selected_date: bookingData.selectedDate,
          notes: bookingData.notes,
          total_price: bookingData.totalPrice,
          deposit_amount: bookingData.depositAmount,
          status: "pending_payment",
          created_at: bookingData.createdAt,
          line_user_id: bookingData.lineUserId,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      bookingId: data?.id,
      message: "การจองสำเร็จ",
      data,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("bookings").select("*")
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}
