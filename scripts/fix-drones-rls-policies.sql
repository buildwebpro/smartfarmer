-- แก้ไข RLS Policies สำหรับตาราง drones

-- ลบ policies เก่าทั้งหมด (ถ้ามี)
DROP POLICY IF EXISTS "drones_select_public" ON drones;
DROP POLICY IF EXISTS "drones_select_authenticated" ON drones;
DROP POLICY IF EXISTS "drones_all_authenticated" ON drones;
DROP POLICY IF EXISTS "drones_all_service_role" ON drones;
DROP POLICY IF EXISTS "Allow public read access" ON drones;
DROP POLICY IF EXISTS "Allow authenticated users" ON drones;

-- เปิด RLS (ถ้ายังไม่เปิด)
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;

-- สร้าง policies ใหม่

-- 1. อนุญาตให้ทุกคน (anon + authenticated) อ่านข้อมูลโดรนที่ is_active = true
CREATE POLICY "drones_select_public"
ON drones FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- 2. อนุญาตให้ authenticated users ทำทุกอย่างได้ (สำหรับ admin)
CREATE POLICY "drones_all_authenticated"
ON drones FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. อนุญาตให้ service_role ทำทุกอย่างได้
CREATE POLICY "drones_all_service_role"
ON drones FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ตรวจสอบ policies ที่สร้าง
SELECT
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'drones';

-- ตรวจสอบข้อมูลโดรน
SELECT
    id,
    name,
    model,
    status,
    battery_level,
    is_active,
    created_at
FROM drones
ORDER BY created_at DESC;
