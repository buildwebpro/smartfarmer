import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { validateBookingData, sanitizeInput, logSecurityEvent } from "@/lib/security"

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

    // Validate and sanitize input data
    const validation = validateBookingData(bookingData)
    if (!validation.valid) {
      logSecurityEvent('INVALID_BOOKING_DATA', { errors: validation.errors }, request)
      return NextResponse.json({ 
        error: "ข้อมูลไม่ถูกต้อง", 
        details: validation.errors 
      }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedData = {
      ...bookingData,
      customerName: sanitizeInput(bookingData.customerName),
      notes: sanitizeInput(bookingData.notes || ''),
      gpsCoordinates: sanitizeInput(bookingData.gpsCoordinates || ''),
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

    // Insert to Supabase with sanitized data
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          booking_code: `DR${Date.now()}`, // Generate unique booking code
          customer_name: sanitizedData.customerName,
          customer_phone: sanitizedData.phoneNumber.replace(/[-\s]/g, ''),
          area_size: parseFloat(sanitizedData.areaSize),
          gps_coordinates: sanitizedData.gpsCoordinates,
          scheduled_date: sanitizedData.selectedDate ? new Date(sanitizedData.selectedDate).toISOString().split('T')[0] : null,
          scheduled_time: "08:00:00", // เพิ่ม default time
          notes: `พืช: ${cropTypeMap[sanitizedData.cropType] || sanitizedData.cropType}\nสารพ่น: ${sprayTypeMap[sanitizedData.sprayType] || sanitizedData.sprayType}\n${sanitizedData.notes ? '\nหมายเหตุ: ' + sanitizedData.notes : ''}`,
          total_price: sanitizedData.totalPrice,
          deposit_amount: sanitizedData.depositAmount,
          status: "pending_payment",
          line_user_id: sanitizedData.lineUserId || null,
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
    console.log('[API] Fetching bookings...')
    const startTime = Date.now()
    
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50) // จำกัดผลลัพธ์เพื่อความเร็ว
    
    console.log(`[API] Bookings query took: ${Date.now() - startTime}ms`)
    
    if (error) {
      console.error("Error fetching bookings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log(`[API] Bookings response ready in: ${Date.now() - startTime}ms`)
    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}
