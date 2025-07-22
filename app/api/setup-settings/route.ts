import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST() {
  try {
    // Insert default settings directly (table should exist already or be created manually)
    const defaultSettings = [
      { key: 'site_name', value: 'Drone Booking Service', description: 'ชื่อเว็บไซต์', category: 'general', data_type: 'string' },
      { key: 'site_description', value: 'บริการจองโดรนพ่นยาเกษตร', description: 'คำอธิบายเว็บไซต์', category: 'general', data_type: 'string' },
      { key: 'contact_email', value: 'admin@dronebooking.com', description: 'อีเมลติดต่อ', category: 'general', data_type: 'string' },
      { key: 'contact_phone', value: '02-123-4567', description: 'เบอร์โทรติดต่อ', category: 'general', data_type: 'string' },
      { key: 'email_notifications', value: 'true', description: 'แจ้งเตือนทางอีเมล', category: 'notifications', data_type: 'boolean' },
      { key: 'sms_notifications', value: 'false', description: 'แจ้งเตือนทาง SMS', category: 'notifications', data_type: 'boolean' },
      { key: 'push_notifications', value: 'true', description: 'แจ้งเตือนแบบ Push', category: 'notifications', data_type: 'boolean' },
      { key: 'max_bookings_per_day', value: '10', description: 'จำนวนการจองสูงสุดต่อวัน', category: 'system', data_type: 'number' },
      { key: 'booking_time_slots', value: '8', description: 'จำนวนช่วงเวลาการจอง', category: 'system', data_type: 'number' },
      { key: 'default_deposit', value: '1000', description: 'ยอดมัดจำเริ่มต้น (บาท)', category: 'system', data_type: 'number' },
      { key: 'default_language', value: 'th', description: 'ภาษาเริ่มต้น', category: 'system', data_type: 'string' },
      { key: 'primary_color', value: 'emerald', description: 'สีหลักของธีม', category: 'theme', data_type: 'string' },
      { key: 'dark_mode', value: 'false', description: 'โหมดมืด', category: 'theme', data_type: 'boolean' },
      { key: 'session_timeout', value: '30', description: 'เวลาหมดอายุ Session (นาที)', category: 'security', data_type: 'number' },
      { key: 'require_two_factor', value: 'false', description: 'การยืนยันตัวตน 2 ขั้นตอน', category: 'security', data_type: 'boolean' },
      { key: 'password_expiry', value: '90', description: 'วันหมดอายุรหัสผ่าน (วัน)', category: 'security', data_type: 'number' }
    ]

    // Try to insert one by one to see which ones fail
    const results = []
    for (const setting of defaultSettings) {
      const { data, error } = await supabase
        .from('settings')
        .upsert(setting, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        })
        .select()
      
      if (error) {
        console.error(`Error inserting setting ${setting.key}:`, error)
        results.push({ key: setting.key, success: false, error: error.message })
      } else {
        results.push({ key: setting.key, success: true })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings setup completed',
      results
    })

  } catch (error) {
    console.error('Error in setup API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
