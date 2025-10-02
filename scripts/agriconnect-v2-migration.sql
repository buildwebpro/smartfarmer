-- ========================================
-- AgriConnect v2.0 - Complete Migration Script
-- Marketplace Platform for Agriculture
-- ========================================

-- Enable PostGIS extension for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- ========================================
-- 1. Extend customers table to support multiple roles
-- ========================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'farmer'
  CHECK (role IN ('farmer', 'provider', 'equipment_owner', 'extension_officer', 'admin'));
ALTER TABLE customers ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- ========================================
-- 2. Service Providers (ผู้รับจ้าง/ผู้เชี่ยวชาญ)
-- ========================================

CREATE TABLE IF NOT EXISTS service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    service_types TEXT[], -- ['พ่นยา', 'ไถนา', 'เกี่ยวข้าว', 'วางระบบน้ำ']
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    coverage_area JSONB, -- {"provinces": ["นครราชสีมา", "ขอนแก่น"], "max_distance_km": 50}
    certifications TEXT[], -- ['ใบอนุญาตนักบินโดรน', 'GAP', 'ความปลอดภัย']
    portfolio_images TEXT[],
    years_experience INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_jobs_completed INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. Farm Profiles (โปรไฟล์ฟาร์ม)
-- ========================================

CREATE TABLE IF NOT EXISTS farm_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    farm_name VARCHAR(255),
    farm_size DECIMAL(10,2), -- ไร่
    crops TEXT[], -- ['ข้าว', 'อ้อย', 'ข้าวโพด']
    location GEOGRAPHY(POINT, 4326), -- PostGIS point
    address TEXT,
    province VARCHAR(100),
    district VARCHAR(100),
    subdistrict VARCHAR(100),
    zipcode VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. Job Postings (งานที่เกษตรกรโพสต์)
-- ========================================

CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- 'พ่นยา', 'ไถนา', 'เกี่ยวข้าว', 'วางระบบน้ำ', 'อื่นๆ'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    area_size DECIMAL(10,2), -- ไร่
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    province VARCHAR(100),
    district VARCHAR(100),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    deadline DATE,
    preferred_date DATE,
    status VARCHAR(20) DEFAULT 'open'
      CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'closed')),
    selected_proposal_id UUID,
    images TEXT[],
    view_count INTEGER DEFAULT 0,
    proposal_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. Proposals (ข้อเสนอจากผู้รับจ้าง)
-- ========================================

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    estimated_duration VARCHAR(50), -- "1-2 วัน", "3-5 ชั่วโมง"
    description TEXT,
    images TEXT[], -- รูปผลงาน/อุปกรณ์
    status VARCHAR(20) DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. Reviews (รีวิว 2-way)
-- ========================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT, -- คำตอบจากผู้ถูกรีวิว
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. Farm Calendar (ปฏิทินเพาะปลูก)
-- ========================================

CREATE TABLE IF NOT EXISTS farm_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'ปลูก', 'ใส่ปุ๋ย', 'พ่นยา', 'เกี่ยว', 'อื่นๆ'
    crop VARCHAR(100),
    date DATE NOT NULL,
    notes TEXT,
    alert_sent BOOLEAN DEFAULT false,
    auto_generated BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 8. Crop Schedules (Template ปฏิทินตามพืช)
-- ========================================

CREATE TABLE IF NOT EXISTS crop_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name VARCHAR(100) NOT NULL,
    day_from_planting INTEGER NOT NULL,
    activity VARCHAR(50) NOT NULL,
    description TEXT,
    alert_days_before INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 9. Messages (Chat in-app)
-- ========================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 10. Government API Cache
-- ========================================

CREATE TABLE IF NOT EXISTS gov_api_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_source VARCHAR(50), -- 'TMD', 'DoAE', 'data.go.th'
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    data JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 11. Notifications (ขยายจากที่มี)
-- ========================================

-- Add new notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('booking_confirmed', 'payment_received', 'reminder', 'completed',
                  'new_job', 'new_proposal', 'proposal_accepted', 'proposal_rejected',
                  'job_assigned', 'review_received', 'message_received'));

-- ========================================
-- Create Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_service_providers_user ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_verified ON service_providers(is_verified);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_user ON farm_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_location ON farm_profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_farmer ON job_postings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_job_postings_created ON job_postings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_job ON proposals(job_id);
CREATE INDEX IF NOT EXISTS idx_proposals_provider ON proposals(provider_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job ON reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_farm_calendar_user_date ON farm_calendar(user_id, date);
CREATE INDEX IF NOT EXISTS idx_farm_calendar_date ON farm_calendar(date);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_job ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_gov_api_cache_key ON gov_api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_customers_role ON customers(role);

-- ========================================
-- Create Triggers for updated_at
-- ========================================

CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_profiles_updated_at BEFORE UPDATE ON farm_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_calendar_updated_at BEFORE UPDATE ON farm_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crop_schedules_updated_at BEFORE UPDATE ON crop_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Seed Crop Schedules (ข้าว)
-- ========================================

INSERT INTO crop_schedules (crop_name, day_from_planting, activity, description, alert_days_before) VALUES
('ข้าว', 0, 'ปลูก', 'เริ่มปลูกข้าว', 0),
('ข้าว', 7, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 1 (ยูเรีย 15-0-0)', 3),
('ข้าว', 30, 'พ่นยา', 'พ่นยาป้องกันโรคใบจุดสีน้ำตาล', 3),
('ข้าว', 45, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 2 (สูตร 16-16-8)', 3),
('ข้าว', 60, 'พ่นยา', 'พ่นยากำจัดแมลงศัตรูข้าว', 3),
('ข้าว', 90, 'ระบายน้ำ', 'ระบายน้ำเพื่อเตรียมเก็บเกี่ยว', 5),
('ข้าว', 120, 'เกี่ยว', 'เก็บเกี่ยวข้าว', 7);

-- ========================================
-- Seed Crop Schedules (อ้อย)
-- ========================================

INSERT INTO crop_schedules (crop_name, day_from_planting, activity, description, alert_days_before) VALUES
('อ้อย', 0, 'ปลูก', 'เริ่มปลูกอ้อย', 0),
('อ้อย', 15, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยรองก้น (สูตร 15-15-15)', 3),
('อ้อย', 60, 'พ่นยา', 'พ่นยาป้องกันโรคใบจุด', 3),
('อ้อย', 90, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 2', 3),
('อ้อย', 180, 'พ่นยา', 'พ่นยากำจัดหนอนเจาะลำต้น', 5),
('อ้อย', 365, 'เกี่ยว', 'เก็บเกี่ยวอ้อย', 14);

-- ========================================
-- Seed Crop Schedules (ข้าวโพด)
-- ========================================

INSERT INTO crop_schedules (crop_name, day_from_planting, activity, description, alert_days_before) VALUES
('ข้าวโพด', 0, 'ปลูก', 'เริ่มปลูกข้าวโพด', 0),
('ข้าวโพด', 10, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 1 (สูตร 15-15-15)', 2),
('ข้าวโพด', 30, 'พ่นยา', 'พ่นยากำจัดหนอนกระทู้ข้าวโพด', 3),
('ข้าวโพด', 45, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 2 (ยูเรีย)', 3),
('ข้าวโพด', 75, 'เกี่ยว', 'เก็บเกี่ยวข้าวโพด', 5);

-- ========================================
-- Create Views for Easy Querying
-- ========================================

-- View: Available service providers
CREATE OR REPLACE VIEW available_providers AS
SELECT
    sp.*,
    c.name as provider_name,
    c.phone as provider_phone,
    c.province,
    c.verified as user_verified,
    c.avatar_url
FROM service_providers sp
JOIN customers c ON sp.user_id = c.id
WHERE sp.is_verified = true AND c.role = 'provider';

-- View: Open jobs with farmer info
CREATE OR REPLACE VIEW open_jobs AS
SELECT
    jp.*,
    c.name as farmer_name,
    c.phone as farmer_phone,
    c.avatar_url as farmer_avatar
FROM job_postings jp
JOIN customers c ON jp.farmer_id = c.id
WHERE jp.status = 'open'
ORDER BY jp.created_at DESC;

-- ========================================
-- Add Comments for Documentation
-- ========================================

COMMENT ON TABLE service_providers IS 'ผู้ให้บริการ/ผู้รับจ้าง - เก็บข้อมูลโปรไฟล์และความเชี่ยวชาญ';
COMMENT ON TABLE farm_profiles IS 'โปรไฟล์ฟาร์มของเกษตรกร - เก็บข้อมูลพื้นที่และพืชที่ปลูก';
COMMENT ON TABLE job_postings IS 'งานที่เกษตรกรโพสต์ - ให้ผู้รับจ้างส่งข้อเสนอ';
COMMENT ON TABLE proposals IS 'ข้อเสนอจากผู้รับจ้างสำหรับงานแต่ละงาน';
COMMENT ON TABLE reviews IS 'รีวิวและเรตติ้งแบบ 2 ทาง (เกษตรกร ↔ ผู้รับจ้าง)';
COMMENT ON TABLE farm_calendar IS 'ปฏิทินกิจกรรมการเกษตรของเกษตรกร';
COMMENT ON TABLE crop_schedules IS 'Template กำหนดการสำหรับแต่ละชนิดพืช';
COMMENT ON TABLE messages IS 'ข้อความแชทระหว่างผู้ใช้';
COMMENT ON TABLE gov_api_cache IS 'Cache ข้อมูลจาก Government APIs';

-- ========================================
-- Success Message
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ AgriConnect v2.0 Migration Completed Successfully!';
    RAISE NOTICE '📊 Tables created: service_providers, farm_profiles, job_postings, proposals, reviews, farm_calendar, crop_schedules, messages, gov_api_cache';
    RAISE NOTICE '🌱 Seed data inserted: crop schedules for ข้าว, อ้อย, ข้าวโพด';
    RAISE NOTICE '🔍 Indexes and triggers created for optimal performance';
    RAISE NOTICE '👉 Next step: Setup RLS policies';
END $$;
