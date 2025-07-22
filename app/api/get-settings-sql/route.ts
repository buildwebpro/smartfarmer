import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const sqlScript = `-- Settings Table Schema for Drone Booking Service
-- Copy and paste this into Supabase SQL Editor

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    data_type VARCHAR(20) DEFAULT 'string',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category);

-- Create trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON public.settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value, description, category, data_type) VALUES
-- General Settings
('site_name', 'Drone Booking Service', 'ชื่อเว็บไซต์', 'general', 'string'),
('site_description', 'บริการจองโดรนพ่นยาเกษตร', 'คำอธิบายเว็บไซต์', 'general', 'string'),
('contact_email', 'admin@dronebooking.com', 'อีเมลติดต่อ', 'general', 'string'),
('contact_phone', '02-123-4567', 'เบอร์โทรติดต่อ', 'general', 'string'),

-- Notification Settings
('email_notifications', 'true', 'แจ้งเตือนทางอีเมล', 'notifications', 'boolean'),
('sms_notifications', 'false', 'แจ้งเตือนทาง SMS', 'notifications', 'boolean'),
('push_notifications', 'true', 'แจ้งเตือนแบบ Push', 'notifications', 'boolean'),

-- System Settings
('max_bookings_per_day', '10', 'จำนวนการจองสูงสุดต่อวัน', 'system', 'number'),
('booking_time_slots', '8', 'จำนวนช่วงเวลาการจอง', 'system', 'number'),
('default_deposit', '1000', 'ยอดมัดจำเริ่มต้น (บาท)', 'system', 'number'),
('default_language', 'th', 'ภาษาเริ่มต้น', 'system', 'string'),

-- Theme & Security Settings
('primary_color', 'emerald', 'สีหลักของธีม', 'theme', 'string'),
('dark_mode', 'false', 'โหมดมืด', 'theme', 'boolean'),
('session_timeout', '30', 'เวลาหมดอายุ Session (นาที)', 'security', 'number'),
('require_two_factor', 'false', 'การยืนยันตัวตน 2 ขั้นตอน', 'security', 'boolean'),
('password_expiry', '90', 'วันหมดอายุรหัสผ่าน (วัน)', 'security', 'number')

ON CONFLICT (key) DO NOTHING;

-- Verify the table was created
SELECT 'Settings table created successfully!' as message;
SELECT COUNT(*) as total_settings FROM public.settings;`

  return NextResponse.json({
    success: true,
    message: 'SQL Script for creating settings table',
    sql: sqlScript,
    instructions: [
      '1. Go to your Supabase project dashboard',
      '2. Navigate to SQL Editor',
      '3. Copy and paste the SQL script above',
      '4. Click "Run" to execute',
      '5. Refresh the settings page after execution'
    ]
  })
}
