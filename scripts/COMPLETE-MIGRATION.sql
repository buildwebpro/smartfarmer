-- ========================================
-- AgriConnect v2.0 - COMPLETE MIGRATION
-- รันไฟล์นี้ไฟล์เดียวใน Supabase SQL Editor
-- ========================================

-- Enable PostGIS extension for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- ========================================
-- STEP 1: MAIN MIGRATION - สร้าง Tables
-- ========================================

-- 1. Extend customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'farmer'
  CHECK (role IN ('farmer', 'provider', 'equipment_owner', 'extension_officer', 'admin'));
ALTER TABLE customers ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- 2. Service Providers
CREATE TABLE IF NOT EXISTS service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    service_types TEXT[],
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    coverage_area JSONB,
    certifications TEXT[],
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

-- 3. Farm Profiles
CREATE TABLE IF NOT EXISTS farm_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    farm_name VARCHAR(255),
    farm_size DECIMAL(10,2),
    crops TEXT[],
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    province VARCHAR(100),
    district VARCHAR(100),
    subdistrict VARCHAR(100),
    zipcode VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Job Postings
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    area_size DECIMAL(10,2),
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

-- 5. Proposals
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    estimated_duration VARCHAR(50),
    description TEXT,
    images TEXT[],
    status VARCHAR(20) DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Farm Calendar
CREATE TABLE IF NOT EXISTS farm_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    crop VARCHAR(100),
    date DATE NOT NULL,
    notes TEXT,
    alert_sent BOOLEAN DEFAULT false,
    auto_generated BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Crop Schedules
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

-- 9. Messages
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

-- 10. Government API Cache
CREATE TABLE IF NOT EXISTS gov_api_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_source VARCHAR(50),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    data JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Create Indexes
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
-- Create Triggers
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
-- Seed Crop Schedules
-- ========================================

INSERT INTO crop_schedules (crop_name, day_from_planting, activity, description, alert_days_before) VALUES
('ข้าว', 0, 'ปลูก', 'เริ่มปลูกข้าว', 0),
('ข้าว', 7, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 1 (ยูเรีย 15-0-0)', 3),
('ข้าว', 30, 'พ่นยา', 'พ่นยาป้องกันโรคใบจุดสีน้ำตาล', 3),
('ข้าว', 45, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 2 (สูตร 16-16-8)', 3),
('ข้าว', 60, 'พ่นยา', 'พ่นยากำจัดแมลงศัตรูข้าว', 3),
('ข้าว', 90, 'ระบายน้ำ', 'ระบายน้ำเพื่อเตรียมเก็บเกี่ยว', 5),
('ข้าว', 120, 'เกี่ยว', 'เก็บเกี่ยวข้าว', 7),

('อ้อย', 0, 'ปลูก', 'เริ่มปลูกอ้อย', 0),
('อ้อย', 15, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยรองก้น (สูตร 15-15-15)', 3),
('อ้อย', 60, 'พ่นยา', 'พ่นยาป้องกันโรคใบจุด', 3),
('อ้อย', 90, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 2', 3),
('อ้อย', 180, 'พ่นยา', 'พ่นยากำจัดหนอนเจาะลำต้น', 5),
('อ้อย', 365, 'เกี่ยว', 'เก็บเกี่ยวอ้อย', 14),

('ข้าวโพด', 0, 'ปลูก', 'เริ่มปลูกข้าวโพด', 0),
('ข้าวโพด', 10, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 1 (สูตร 15-15-15)', 2),
('ข้าวโพด', 30, 'พ่นยา', 'พ่นยากำจัดหนอนกระทู้ข้าวโพด', 3),
('ข้าวโพด', 45, 'ใส่ปุ๋ย', 'ใส่ปุ๋ยครั้งที่ 2 (ยูเรีย)', 3),
('ข้าวโพด', 75, 'เกี่ยว', 'เก็บเกี่ยวข้าวโพด', 5)
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 2: RLS POLICIES - ความปลอดภัย
-- ========================================

-- Enable RLS
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gov_api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Helper Function: Get Current User ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM customers WHERE line_user_id = auth.uid()::text LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check if Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'admin' FROM customers WHERE id = get_current_user_id());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SERVICE_PROVIDERS Policies
DROP POLICY IF EXISTS "Public can view verified providers" ON service_providers;
CREATE POLICY "Public can view verified providers" ON service_providers FOR SELECT USING (is_verified = true);

DROP POLICY IF EXISTS "Providers can view own profile" ON service_providers;
CREATE POLICY "Providers can view own profile" ON service_providers FOR SELECT USING (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Providers can create own profile" ON service_providers;
CREATE POLICY "Providers can create own profile" ON service_providers FOR INSERT WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Providers can update own profile" ON service_providers;
CREATE POLICY "Providers can update own profile" ON service_providers FOR UPDATE USING (user_id = get_current_user_id());

-- FARM_PROFILES Policies
DROP POLICY IF EXISTS "Farmers can view own farm" ON farm_profiles;
CREATE POLICY "Farmers can view own farm" ON farm_profiles FOR SELECT USING (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Farmers can create own farm" ON farm_profiles;
CREATE POLICY "Farmers can create own farm" ON farm_profiles FOR INSERT WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Farmers can update own farm" ON farm_profiles;
CREATE POLICY "Farmers can update own farm" ON farm_profiles FOR UPDATE USING (user_id = get_current_user_id());

-- JOB_POSTINGS Policies
DROP POLICY IF EXISTS "Public can view open jobs" ON job_postings;
CREATE POLICY "Public can view open jobs" ON job_postings FOR SELECT USING (status = 'open');

DROP POLICY IF EXISTS "Farmers can view own jobs" ON job_postings;
CREATE POLICY "Farmers can view own jobs" ON job_postings FOR SELECT USING (farmer_id = get_current_user_id());

DROP POLICY IF EXISTS "Farmers can create jobs" ON job_postings;
CREATE POLICY "Farmers can create jobs" ON job_postings FOR INSERT WITH CHECK (farmer_id = get_current_user_id());

DROP POLICY IF EXISTS "Farmers can update own jobs" ON job_postings;
CREATE POLICY "Farmers can update own jobs" ON job_postings FOR UPDATE USING (farmer_id = get_current_user_id());

DROP POLICY IF EXISTS "Farmers can delete own jobs" ON job_postings;
CREATE POLICY "Farmers can delete own jobs" ON job_postings FOR DELETE USING (farmer_id = get_current_user_id());

-- PROPOSALS Policies
DROP POLICY IF EXISTS "Farmers can view job proposals" ON proposals;
CREATE POLICY "Farmers can view job proposals" ON proposals FOR SELECT
USING (job_id IN (SELECT id FROM job_postings WHERE farmer_id = get_current_user_id()));

DROP POLICY IF EXISTS "Providers can view own proposals" ON proposals;
CREATE POLICY "Providers can view own proposals" ON proposals FOR SELECT
USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = get_current_user_id()));

DROP POLICY IF EXISTS "Providers can create proposals" ON proposals;
CREATE POLICY "Providers can create proposals" ON proposals FOR INSERT
WITH CHECK (provider_id IN (SELECT id FROM service_providers WHERE user_id = get_current_user_id()));

DROP POLICY IF EXISTS "Providers can update own pending proposals" ON proposals;
CREATE POLICY "Providers can update own pending proposals" ON proposals FOR UPDATE
USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = get_current_user_id()) AND status = 'pending');

DROP POLICY IF EXISTS "Providers can delete own proposals" ON proposals;
CREATE POLICY "Providers can delete own proposals" ON proposals FOR DELETE
USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = get_current_user_id()));

-- REVIEWS Policies
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (reviewer_id = get_current_user_id());

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (reviewer_id = get_current_user_id());

DROP POLICY IF EXISTS "Reviewees can add response" ON reviews;
CREATE POLICY "Reviewees can add response" ON reviews FOR UPDATE USING (reviewee_id = get_current_user_id());

-- FARM_CALENDAR Policies
DROP POLICY IF EXISTS "Users can view own calendar" ON farm_calendar;
CREATE POLICY "Users can view own calendar" ON farm_calendar FOR SELECT USING (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Users can create calendar" ON farm_calendar;
CREATE POLICY "Users can create calendar" ON farm_calendar FOR INSERT WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Users can update own calendar" ON farm_calendar;
CREATE POLICY "Users can update own calendar" ON farm_calendar FOR UPDATE USING (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Users can delete own calendar" ON farm_calendar;
CREATE POLICY "Users can delete own calendar" ON farm_calendar FOR DELETE USING (user_id = get_current_user_id());

-- CROP_SCHEDULES Policies
DROP POLICY IF EXISTS "Public can view crop schedules" ON crop_schedules;
CREATE POLICY "Public can view crop schedules" ON crop_schedules FOR SELECT USING (true);

-- MESSAGES Policies
DROP POLICY IF EXISTS "Users can view sent messages" ON messages;
CREATE POLICY "Users can view sent messages" ON messages FOR SELECT USING (sender_id = get_current_user_id());

DROP POLICY IF EXISTS "Users can view received messages" ON messages;
CREATE POLICY "Users can view received messages" ON messages FOR SELECT USING (receiver_id = get_current_user_id());

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (sender_id = get_current_user_id());

DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;
CREATE POLICY "Users can mark messages as read" ON messages FOR UPDATE USING (receiver_id = get_current_user_id());

-- GOV_API_CACHE Policies
DROP POLICY IF EXISTS "Public can read cache" ON gov_api_cache;
CREATE POLICY "Public can read cache" ON gov_api_cache FOR SELECT USING (true);

-- CUSTOMERS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON customers;
CREATE POLICY "Users can view own profile" ON customers FOR SELECT USING (id = get_current_user_id());

DROP POLICY IF EXISTS "Users can update own profile" ON customers;
CREATE POLICY "Users can update own profile" ON customers FOR UPDATE USING (id = get_current_user_id());

-- ========================================
-- STEP 3: HELPER FUNCTIONS
-- ========================================

CREATE OR REPLACE FUNCTION increment_proposal_count(job_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE job_postings
    SET proposal_count = COALESCE(proposal_count, 0) + 1
    WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ AgriConnect v2.0 Migration Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Tables created: 10 tables';
    RAISE NOTICE '🔒 RLS policies: Enabled';
    RAISE NOTICE '🌱 Seed data: Inserted (3 crops)';
    RAISE NOTICE '========================================';
    RAISE NOTICE '👉 Next: npm run dev';
    RAISE NOTICE '========================================';
END $$;
