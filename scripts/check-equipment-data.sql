-- ตรวจสอบข้อมูลตาราง equipment

-- 1. ดูจำนวนรายการทั้งหมด
SELECT COUNT(*) as total_equipment FROM equipment;

-- 2. ดูข้อมูลเครื่องจักรทั้งหมด
SELECT
    e.id,
    e.name,
    e.model,
    e.brand,
    e.status,
    e.rental_price_per_day,
    e.deposit_amount,
    e.current_location,
    e.is_active,
    ec.name as category_name,
    e.created_at
FROM equipment e
LEFT JOIN equipment_categories ec ON e.category_id = ec.id
ORDER BY e.created_at DESC;

-- 3. ดูข้อมูล equipment_categories
SELECT id, name, icon, is_active FROM equipment_categories ORDER BY display_order;

-- 4. ตรวจสอบว่ามีตาราง equipment หรือไม่
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%equipment%';

-- 5. ตรวจสอบ RLS policies ของตาราง equipment
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'equipment';
