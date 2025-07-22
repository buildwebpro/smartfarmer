-- Add settings table to store system configurations
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    data_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value, description, category, data_type) VALUES
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
