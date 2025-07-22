-- Enhanced Pilots Table Schema
-- อัพเดทตาราง pilots ให้รองรับข้อมูลครบถ้วน

-- เพิ่มคอลัมน์ใหม่ในตาราง pilots
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS line_id VARCHAR(100);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS address TEXT;

-- เอกสาร/ใบอนุญาต
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS national_id VARCHAR(20);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS passport_no VARCHAR(20);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS uas_license_no VARCHAR(50);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS uas_license_expiry DATE;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS insurance_policy TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS special_certificates TEXT[];

-- ประสบการณ์
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS total_flight_hours DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS agricultural_hours DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS other_hours DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS drone_models_experience JSONB;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS projects_completed INTEGER DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS accident_rate DECIMAL(5,2) DEFAULT 0;

-- สถานะและความพร้อม
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS current_location_lat DECIMAL(10,8);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS current_location_lng DECIMAL(10,8);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS current_location_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS license_expiry_notified BOOLEAN DEFAULT false;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS availability_schedule JSONB;

-- ความปลอดภัย
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS health_check_date DATE;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS health_status TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS safety_score INTEGER DEFAULT 100;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS safety_warnings TEXT[];
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS last_safety_training DATE;

-- การประเมิน
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS punctuality_score DECIMAL(3,2) DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2) DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0;

-- สิทธิการเข้าถึง
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'pilot';
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS permissions TEXT[];
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- ข้อมูลเพิ่มเติม
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS specializations TEXT;

-- สร้างตารางสำหรับบันทึกการปฏิบัติงาน
CREATE TABLE IF NOT EXISTS pilot_flight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id UUID REFERENCES pilots(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    drone_id UUID REFERENCES drones(id),
    flight_date DATE NOT NULL,
    flight_duration DECIMAL(5,2) NOT NULL,
    area_covered DECIMAL(8,2),
    weather_conditions TEXT,
    pre_flight_checklist JSONB,
    post_flight_notes TEXT,
    fuel_consumption DECIMAL(8,2),
    issues_encountered TEXT[],
    customer_rating INTEGER,
    customer_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตารางสำหรับการแจ้งเตือน
CREATE TABLE IF NOT EXISTS pilot_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id UUID REFERENCES pilots(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'medium',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตารางสำหรับการอบรม
CREATE TABLE IF NOT EXISTS pilot_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id UUID REFERENCES pilots(id) ON DELETE CASCADE,
    training_type VARCHAR(100) NOT NULL,
    training_title VARCHAR(255) NOT NULL,
    training_date DATE NOT NULL,
    expiry_date DATE,
    certificate_url TEXT,
    score INTEGER,
    trainer VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง Index สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_pilots_status ON pilots(status);
CREATE INDEX IF NOT EXISTS idx_pilots_location ON pilots(current_location_lat, current_location_lng);
CREATE INDEX IF NOT EXISTS idx_pilots_license_expiry ON pilots(uas_license_expiry);
CREATE INDEX IF NOT EXISTS idx_pilot_flight_logs_date ON pilot_flight_logs(flight_date);
CREATE INDEX IF NOT EXISTS idx_pilot_notifications_pilot_id ON pilot_notifications(pilot_id);
CREATE INDEX IF NOT EXISTS idx_pilot_trainings_pilot_id ON pilot_trainings(pilot_id);

-- สร้าง Function สำหรับแจ้งเตือนใบอนุญาตหมดอายุ
CREATE OR REPLACE FUNCTION check_license_expiry() RETURNS void AS $$
BEGIN
    -- แจ้งเตือน 30 วันก่อนหมดอายุ
    INSERT INTO pilot_notifications (pilot_id, notification_type, title, message, priority, expires_at)
    SELECT 
        id,
        'license_expiry_warning',
        'ใบอนุญาตใกล้หมดอายุ',
        'ใบอนุญาตบินโดรนของคุณจะหมดอายุในอีก 30 วัน กรุณาดำเนินการต่ออายุ',
        'high',
        uas_license_expiry
    FROM pilots 
    WHERE uas_license_expiry IS NOT NULL 
    AND uas_license_expiry BETWEEN CURRENT_DATE + INTERVAL '29 days' AND CURRENT_DATE + INTERVAL '31 days'
    AND NOT license_expiry_notified;

    -- อัพเดทสถานะการแจ้งเตือนแล้ว
    UPDATE pilots 
    SET license_expiry_notified = true 
    WHERE uas_license_expiry IS NOT NULL 
    AND uas_license_expiry BETWEEN CURRENT_DATE + INTERVAL '29 days' AND CURRENT_DATE + INTERVAL '31 days';
END;
$$ LANGUAGE plpgsql;
