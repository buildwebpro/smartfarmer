-- แก้ไข RLS Policies สำหรับตาราง equipment

-- ลบ policies เก่าทั้งหมด
DROP POLICY IF EXISTS "Allow public read access to active equipment" ON equipment;
DROP POLICY IF EXISTS "Allow public read active equipment" ON equipment;
DROP POLICY IF EXISTS "Allow authenticated users to read all equipment" ON equipment;
DROP POLICY IF EXISTS "Allow authenticated read all" ON equipment;
DROP POLICY IF EXISTS "Allow service role full access to equipment" ON equipment;
DROP POLICY IF EXISTS "Allow service role full access" ON equipment;

-- สร้าง policies ใหม่

-- 1. อนุญาตให้ทุกคนอ่านข้อมูล equipment ที่ is_active = true (สำหรับ public/anon key)
CREATE POLICY "equipment_select_public"
ON equipment FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- 2. อนุญาตให้ authenticated users อ่านข้อมูลทั้งหมด
CREATE POLICY "equipment_select_authenticated"
ON equipment FOR SELECT
TO authenticated
USING (true);

-- 3. อนุญาตให้ service_role ทำทุกอย่างได้
CREATE POLICY "equipment_all_service_role"
ON equipment FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ตรวจสอบ policies ที่สร้างแล้ว
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'equipment';
