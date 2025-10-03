-- แก้ไข RLS Policies สำหรับตาราง pilots

-- เปิด RLS (ถ้ายังไม่เปิด)
ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;

-- ลบ policies เก่าทั้งหมด (ถ้ามี)
DROP POLICY IF EXISTS "pilots_select_public" ON pilots;
DROP POLICY IF EXISTS "pilots_select_authenticated" ON pilots;
DROP POLICY IF EXISTS "pilots_all_authenticated" ON pilots;
DROP POLICY IF EXISTS "pilots_all_service_role" ON pilots;
DROP POLICY IF EXISTS "Allow public read access" ON pilots;
DROP POLICY IF EXISTS "Allow authenticated users" ON pilots;
DROP POLICY IF EXISTS "Enable read access for all users" ON pilots;

-- สร้าง policies ใหม่

-- 1. อนุญาตให้ทุกคน (anon + authenticated) อ่านข้อมูลนักบินที่ is_active = true
CREATE POLICY "pilots_select_public"
ON pilots FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- 2. อนุญาตให้ authenticated users ทำทุกอย่างได้ (สำหรับ admin)
CREATE POLICY "pilots_all_authenticated"
ON pilots FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. อนุญาตให้ service_role ทำทุกอย่างได้
CREATE POLICY "pilots_all_service_role"
ON pilots FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ตรวจสอบ policies ที่สร้างแล้ว
SELECT
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'pilots'
ORDER BY policyname;

-- ตรวจสอบข้อมูลนักบิน
SELECT
    id,
    name,
    phone,
    experience_years,
    is_active,
    created_at
FROM pilots
ORDER BY created_at DESC;
