-- Seed initial settings data
-- ใช้ ON CONFLICT เพื่ออัพเดทถ้ามีอยู่แล้ว หรือเพิ่มใหม่ถ้ายังไม่มี

INSERT INTO settings (key, value, data_type, category, description) VALUES
-- General Settings
('site_name', 'Drone Booking Service', 'string', 'general', 'ชื่อเว็บไซต์'),
('site_description', 'บริการจองโดรนพ่นยาเกษตร', 'string', 'general', 'คำอธิบายเว็บไซต์'),
('contact_email', 'admin@dronebooking.com', 'string', 'general', 'อีเมลติดต่อ'),
('contact_phone', '0805585550', 'string', 'general', 'เบอร์โทรติดต่อ'),

-- Notification Settings
('email_notifications', 'true', 'boolean', 'notifications', 'แจ้งเตือนทางอีเมล'),
('sms_notifications', 'false', 'boolean', 'notifications', 'แจ้งเตือนทาง SMS'),
('push_notifications', 'true', 'boolean', 'notifications', 'แจ้งเตือนแบบ Push'),

-- System Settings
('max_bookings_per_day', '10', 'number', 'system', 'จำนวนการจองสูงสุดต่อวัน'),
('booking_time_slots', '8', 'number', 'system', 'จำนวนช่วงเวลาการจอง'),
('default_deposit', '1000', 'number', 'system', 'ยอดมัดจำเริ่มต้น'),
('default_language', 'th', 'string', 'system', 'ภาษาเริ่มต้น'),

-- Theme Settings
('primary_color', 'emerald', 'string', 'theme', 'สีหลักของธีม'),
('dark_mode', 'false', 'boolean', 'theme', 'โหมดมืด'),

-- Security Settings
('session_timeout', '30', 'number', 'security', 'เวลาหมดอายุ Session (นาที)'),
('require_two_factor', 'false', 'boolean', 'security', 'การยืนยันตัวตน 2 ขั้นตอน'),
('password_expiry', '90', 'number', 'security', 'วันหมดอายุรหัสผ่าน (วัน)')

ON CONFLICT (key)
DO UPDATE SET
  value = EXCLUDED.value,
  data_type = EXCLUDED.data_type,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();
