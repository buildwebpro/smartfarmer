-- Migration: Add additional fields for booking system
-- Date: 2025-10-04
-- Description: Add contact info, farm location, service details, and terms acceptance fields

-- Add fields to customers table
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS farm_address TEXT,
  ADD COLUMN IF NOT EXISTS district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);

-- Add fields to bookings table
ALTER TABLE bookings
  -- Contact Information (already exists: customer_phone from line 70)
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),

  -- Farm Location Details
  ADD COLUMN IF NOT EXISTS farm_address TEXT,
  ADD COLUMN IF NOT EXISTS district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100),
  ADD COLUMN IF NOT EXISTS farm_area_size DECIMAL(10,2), -- ขนาดพื้นที่ไร่ (ไร่)
  ADD COLUMN IF NOT EXISTS crop_planted VARCHAR(100), -- ประเภทพืชที่ปลูก
  ADD COLUMN IF NOT EXISTS terrain_type VARCHAR(50) CHECK (terrain_type IN ('flat', 'hilly', 'flooded', 'mixed')), -- ลักษณะภูมิประเทศ

  -- Service Time Details
  ADD COLUMN IF NOT EXISTS pickup_datetime TIMESTAMP WITH TIME ZONE, -- เวลารับเครื่อง
  ADD COLUMN IF NOT EXISTS return_datetime TIMESTAMP WITH TIME ZONE, -- เวลาคืนเครื่อง
  ADD COLUMN IF NOT EXISTS estimated_work_duration DECIMAL(5,2), -- ระยะเวลาทำงานโดยประมาณ (ชั่วโมง)

  -- Additional Service Details
  ADD COLUMN IF NOT EXISTS service_type VARCHAR(50), -- ประเภทการใช้งาน (spray/plow/seed)
  ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(20) CHECK (urgency_level IN ('normal', 'urgent', 'very_urgent')),
  ADD COLUMN IF NOT EXISTS preferred_work_time VARCHAR(20) CHECK (preferred_work_time IN ('morning', 'afternoon', 'evening', 'night')),

  -- Terms and Conditions
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS damage_policy_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fuel_responsibility_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS return_condition_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,

  -- Additional Information
  ADD COLUMN IF NOT EXISTS has_water_source BOOLEAN, -- มีแหล่งน้ำในพื้นที่หรือไม่
  ADD COLUMN IF NOT EXISTS has_obstacles BOOLEAN, -- มีสิ่งกีดขวาง (เสาไฟ/ต้นไม้)
  ADD COLUMN IF NOT EXISTS special_requirements TEXT, -- ความต้องการพิเศษ
  ADD COLUMN IF NOT EXISTS referral_source VARCHAR(100); -- รู้จักจากช่องทางใด

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_datetime ON bookings(pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_return_datetime ON bookings(return_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_province ON bookings(province);
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON bookings(service_type);
CREATE INDEX IF NOT EXISTS idx_bookings_urgency_level ON bookings(urgency_level);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Add comments for documentation
COMMENT ON COLUMN bookings.terrain_type IS 'ลักษณะภูมิประเทศ: flat=ที่ราบ, hilly=เนินเขา, flooded=มีน้ำท่วมขัง, mixed=ผสม';
COMMENT ON COLUMN bookings.urgency_level IS 'ความเร่งด่วน: normal=ปกติ, urgent=เร่งด่วน, very_urgent=เร่งด่วนมาก';
COMMENT ON COLUMN bookings.preferred_work_time IS 'ช่วงเวลาทำงานที่ต้องการ: morning=เช้า, afternoon=บ่าย, evening=เย็น, night=กลางคืน';
COMMENT ON COLUMN bookings.service_type IS 'ประเภทการใช้งาน: spray=พ่นยา, plow=ไถ, seed=หว่านเมล็ด';
