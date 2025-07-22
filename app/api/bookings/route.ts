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

    // Map string IDs to names for database storage
    const cropTypeMap: Record<string, string> = {
      'rice': 'ข้าว',
      'corn': 'ข้าวโพด', 
      'sugarcane': 'อ้อย',
      'cassava': 'มันสำปะหลัง',
      'rubber': 'ยางพารา'
    }

    const sprayTypeMap: Record<string, string> = {
      'herbicide': 'ยาฆ่าหญ้า',
      'insecticide': 'ยาฆ่าแมลง',
      'fertilizer': 'ปุ่ยเหลว',
      'fungicide': 'ยาฆ่าเชื้อรา'
    }

    // Insert to Supabase
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          booking_code: `DR${Date.now()}`, // Generate unique booking code
          customer_name: bookingData.customerName,
          customer_phone: bookingData.phoneNumber,
          area_size: parseFloat(bookingData.areaSize),
          gps_coordinates: bookingData.gpsCoordinates,
          scheduled_date: bookingData.selectedDate ? new Date(bookingData.selectedDate).toISOString().split('T')[0] : null,
          scheduled_time: "08:00:00", // เพิ่ม default time
          notes: `พืช: ${cropTypeMap[bookingData.cropType] || bookingData.cropType}\nสารพ่น: ${sprayTypeMap[bookingData.sprayType] || bookingData.sprayType}\n${bookingData.notes ? '\nหมายเหตุ: ' + bookingData.notes : ''}`,
          total_price: bookingData.totalPrice,
          deposit_amount: bookingData.depositAmount,
          status: "pending_payment",
          line_user_id: bookingData.lineUserId || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
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
