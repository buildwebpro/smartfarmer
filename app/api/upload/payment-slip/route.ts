import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bookingId = formData.get('bookingId') as string

    if (!file || !bookingId) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบไฟล์หรือรหัสการจอง" 
      }, { status: 400 })
    }

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: "รองรับเฉพาะไฟล์รูปภาพเท่านั้น" 
      }, { status: 400 })
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: "ขนาดไฟล์ต้องไม่เกิน 5MB" 
      }, { status: 400 })
    }

    // สร้างชื่อไฟล์ที่ไม่ซ้ำ
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `payment-slip-${bookingId}-${timestamp}${fileExtension}`
    
    // เส้นทางสำหรับเก็บไฟล์
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-slips')
    const filePath = path.join(uploadDir, fileName)
    
    // สร้างโฟลเดอร์ถ้าไม่มี
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // โฟลเดอร์มีอยู่แล้ว
    }

    // แปลงไฟล์เป็น buffer และบันทึก
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL สำหรับเข้าถึงไฟล์
    const imageUrl = `/uploads/payment-slips/${fileName}`

    // อัพเดทฐานข้อมูล
    const { error } = await supabase
      .from("bookings")
      .update({ 
        payment_slip_url: imageUrl,
        status: 'paid' // เปลี่ยนสถานะเป็นชำระแล้ว
      })
      .eq("id", bookingId)

    if (error) {
      console.error("Database update error:", error)
      return NextResponse.json({ 
        success: false, 
        error: "เกิดข้อผิดพลาดในการอัพเดทฐานข้อมูล" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "อัพโหลดสลิปการโอนเงินสำเร็จ"
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์" 
    }, { status: 500 })
  }
}
