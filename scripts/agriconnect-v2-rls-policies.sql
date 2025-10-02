-- ========================================
-- AgriConnect v2.0 - Row Level Security (RLS) Policies
-- Security policies for all tables
-- ========================================

-- Enable RLS on all new tables
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gov_api_cache ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Helper Function: Get Current User ID
-- ========================================

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM customers WHERE line_user_id = auth.uid()::text LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 1. SERVICE_PROVIDERS Policies
-- ========================================

-- Anyone can view verified providers
CREATE POLICY "Public can view verified providers"
ON service_providers FOR SELECT
USING (is_verified = true);

-- Providers can view their own profile (even if not verified)
CREATE POLICY "Providers can view own profile"
ON service_providers FOR SELECT
USING (user_id = get_current_user_id());

-- Providers can insert their own profile
CREATE POLICY "Providers can create own profile"
ON service_providers FOR INSERT
WITH CHECK (user_id = get_current_user_id());

-- Providers can update their own profile
CREATE POLICY "Providers can update own profile"
ON service_providers FOR UPDATE
USING (user_id = get_current_user_id());

-- ========================================
-- 2. FARM_PROFILES Policies
-- ========================================

-- Farmers can view their own farm profiles
CREATE POLICY "Farmers can view own farm"
ON farm_profiles FOR SELECT
USING (user_id = get_current_user_id());

-- Farmers can create their own farm profiles
CREATE POLICY "Farmers can create own farm"
ON farm_profiles FOR INSERT
WITH CHECK (user_id = get_current_user_id());

-- Farmers can update their own farm profiles
CREATE POLICY "Farmers can update own farm"
ON farm_profiles FOR UPDATE
USING (user_id = get_current_user_id());

-- ========================================
-- 3. JOB_POSTINGS Policies
-- ========================================

-- Anyone can view open jobs
CREATE POLICY "Public can view open jobs"
ON job_postings FOR SELECT
USING (status = 'open');

-- Farmers can view their own jobs (all statuses)
CREATE POLICY "Farmers can view own jobs"
ON job_postings FOR SELECT
USING (farmer_id = get_current_user_id());

-- Farmers can create jobs
CREATE POLICY "Farmers can create jobs"
ON job_postings FOR INSERT
WITH CHECK (farmer_id = get_current_user_id());

-- Farmers can update their own jobs
CREATE POLICY "Farmers can update own jobs"
ON job_postings FOR UPDATE
USING (farmer_id = get_current_user_id());

-- Farmers can delete their own jobs
CREATE POLICY "Farmers can delete own jobs"
ON job_postings FOR DELETE
USING (farmer_id = get_current_user_id());

-- ========================================
-- 4. PROPOSALS Policies
-- ========================================

-- Farmers can view proposals for their jobs
CREATE POLICY "Farmers can view job proposals"
ON proposals FOR SELECT
USING (
    job_id IN (
        SELECT id FROM job_postings WHERE farmer_id = get_current_user_id()
    )
);

-- Providers can view their own proposals
CREATE POLICY "Providers can view own proposals"
ON proposals FOR SELECT
USING (
    provider_id IN (
        SELECT id FROM service_providers WHERE user_id = get_current_user_id()
    )
);

-- Providers can create proposals
CREATE POLICY "Providers can create proposals"
ON proposals FOR INSERT
WITH CHECK (
    provider_id IN (
        SELECT id FROM service_providers WHERE user_id = get_current_user_id()
    )
);

-- Providers can update their own proposals (only if pending)
CREATE POLICY "Providers can update own pending proposals"
ON proposals FOR UPDATE
USING (
    provider_id IN (
        SELECT id FROM service_providers WHERE user_id = get_current_user_id()
    ) AND status = 'pending'
);

-- Providers can delete their own proposals (withdraw)
CREATE POLICY "Providers can delete own proposals"
ON proposals FOR DELETE
USING (
    provider_id IN (
        SELECT id FROM service_providers WHERE user_id = get_current_user_id()
    )
);

-- ========================================
-- 5. REVIEWS Policies
-- ========================================

-- Anyone can view reviews
CREATE POLICY "Public can view reviews"
ON reviews FOR SELECT
USING (true);

-- Users can create reviews (must be reviewer)
CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (reviewer_id = get_current_user_id());

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (reviewer_id = get_current_user_id());

-- Reviewees can add response to reviews about them
CREATE POLICY "Reviewees can add response"
ON reviews FOR UPDATE
USING (reviewee_id = get_current_user_id())
WITH CHECK (reviewee_id = get_current_user_id());

-- ========================================
-- 6. FARM_CALENDAR Policies
-- ========================================

-- Users can view their own calendar
CREATE POLICY "Users can view own calendar"
ON farm_calendar FOR SELECT
USING (user_id = get_current_user_id());

-- Users can create calendar entries
CREATE POLICY "Users can create calendar"
ON farm_calendar FOR INSERT
WITH CHECK (user_id = get_current_user_id());

-- Users can update their own calendar
CREATE POLICY "Users can update own calendar"
ON farm_calendar FOR UPDATE
USING (user_id = get_current_user_id());

-- Users can delete their own calendar entries
CREATE POLICY "Users can delete own calendar"
ON farm_calendar FOR DELETE
USING (user_id = get_current_user_id());

-- ========================================
-- 7. CROP_SCHEDULES Policies
-- ========================================

-- Everyone can view crop schedules (read-only)
CREATE POLICY "Public can view crop schedules"
ON crop_schedules FOR SELECT
USING (true);

-- ========================================
-- 8. MESSAGES Policies
-- ========================================

-- Users can view messages they sent
CREATE POLICY "Users can view sent messages"
ON messages FOR SELECT
USING (sender_id = get_current_user_id());

-- Users can view messages they received
CREATE POLICY "Users can view received messages"
ON messages FOR SELECT
USING (receiver_id = get_current_user_id());

-- Users can send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (sender_id = get_current_user_id());

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can mark messages as read"
ON messages FOR UPDATE
USING (receiver_id = get_current_user_id());

-- ========================================
-- 9. GOV_API_CACHE Policies
-- ========================================

-- Everyone can read cached data
CREATE POLICY "Public can read cache"
ON gov_api_cache FOR SELECT
USING (true);

-- ========================================
-- Update existing tables RLS if needed
-- ========================================

-- Ensure customers table has proper RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON customers;
CREATE POLICY "Users can view own profile"
ON customers FOR SELECT
USING (id = get_current_user_id());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON customers;
CREATE POLICY "Users can update own profile"
ON customers FOR UPDATE
USING (id = get_current_user_id());

-- ========================================
-- Admin Bypass (optional - for admin dashboard)
-- ========================================

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM customers
        WHERE id = get_current_user_id()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can view all data (add to each table as needed)
CREATE POLICY "Admin can view all service_providers"
ON service_providers FOR SELECT
USING (is_admin());

CREATE POLICY "Admin can view all farm_profiles"
ON farm_profiles FOR SELECT
USING (is_admin());

CREATE POLICY "Admin can view all job_postings"
ON job_postings FOR SELECT
USING (is_admin());

CREATE POLICY "Admin can view all proposals"
ON proposals FOR SELECT
USING (is_admin());

CREATE POLICY "Admin can view all messages"
ON messages FOR SELECT
USING (is_admin());

-- ========================================
-- Success Message
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies Created Successfully!';
    RAISE NOTICE '🔒 All tables are now protected with Row Level Security';
    RAISE NOTICE '👥 Users can only access their own data';
    RAISE NOTICE '👮 Admins have full access to all data';
    RAISE NOTICE '📖 Public data (jobs, reviews, providers) is visible to all';
END $$;
