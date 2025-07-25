import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    console.log('[API] Fetching notifications...')
    const startTime = Date.now()
    
    // ใช้ข้อมูลจำลองแทนการ query database เพื่อความเร็ว
    const notifications = [
      {
        id: 'demo-1',
        type: 'warning',
        title: 'โดรน DJI Mavic 3 ต้องการการบำรุงรักษา',
        message: 'ครบกำหนดบำรุงรักษาในอีก 2 วัน',
        createdAt: new Date().toISOString(),
        priority: 'high'
      },
      {
        id: 'demo-2',
        type: 'info',
        title: 'มีออร์เดอร์ใหม่ 3 รายการรอการยืนยัน',
        message: 'กรุณาตรวจสอบและยืนยันออร์เดอร์',
        createdAt: new Date().toISOString(),
        priority: 'medium'
      },
      {
        id: 'demo-3',
        type: 'success',
        title: 'ยอดขายเดือนนี้เพิ่มขึ้น 15%',
        message: 'เมื่อเทียบกับเดือนที่แล้ว',
        createdAt: new Date().toISOString(),
        priority: 'low'
      }
    ]

    console.log(`[API] Notifications response ready in: ${Date.now() - startTime}ms`)
    
    return NextResponse.json({
      success: true,
      data: notifications,
      total: notifications.length
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
