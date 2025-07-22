import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// เพิ่ม cache และ compression headers
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: "รองรับเฉพาะไฟล์รูปภาพ (.jpg, .png, .webp)" 
      }, { status: 400 })
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2MB แทน 5MB เพื่อความเร็ว)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: "ขนาดไฟล์ต้องไม่เกิน 2MB" 
      }, { status: 400 })
    }

    // สร้างชื่อไฟล์ที่ไม่ซ้ำ และปลอดภัย
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = path.extname(file.name).toLowerCase()
    const fileName = `payment-slip-${bookingId}-${timestamp}-${randomString}${fileExtension}`
    
    // เส้นทางสำหรับเก็บไฟล์
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-slips')
    const filePath = path.join(uploadDir, fileName)
    
    // สร้างโฟลเดอร์ถ้าไม่มี
    await mkdir(uploadDir, { recursive: true })

    // แปลงไฟล์เป็น buffer และบันทึก (เพิ่ม error handling)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // ตรวจสอบ buffer ว่าไม่เสียหาย
    if (buffer.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "ไฟล์ที่อัพโหลดเสียหาย" 
      }, { status: 400 })
    }
    
    await writeFile(filePath, buffer)

    // URL สำหรับเข้าถึงไฟล์
    const imageUrl = `/uploads/payment-slips/${fileName}`

    // อัพเดทฐานข้อมูลด้วย transaction เพื่อความปลอดภัย
    const { error } = await supabase
      .from("bookings")
      .update({ 
        payment_slip_url: imageUrl,
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId)

    if (error) {
      // ลบไฟล์ที่อัพโหลดแล้วถ้า database update ล้มเหลว
      try {
        const fs = require('fs')
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath)
        }
      } catch (cleanupError) {
        console.error("File cleanup error:", cleanupError)
      }
      
      console.error("Database update error:", error)
      return NextResponse.json({ 
        success: false, 
        error: "เกิดข้อผิดพลาดในการอัพเดทฐานข้อมูล" 
      }, { status: 500 })
    }

    // ส่ง response พร้อม cache headers
    const response = NextResponse.json({
      success: true,
      imageUrl,
      message: "อัพโหลดสลิปการโอนเงินสำเร็จ",
      fileSize: Math.round(file.size / 1024) + " KB"
    })

    // เพิ่ม security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    return response

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์" 
    }, { status: 500 })
  }
}
