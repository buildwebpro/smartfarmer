-- ตรวจสอบโครงสร้างตาราง pilots ในฐานข้อมูล Supabase
-- คำสั่งนี้จะแสดงรายชื่อคอลัมน์ทั้งหมดในตาราง pilots

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pilots' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ตรวจสอบว่ามีตารางเสริมหรือไม่
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'pilot_flight_logs', 
    'pilot_notifications', 
    'pilot_trainings'
)
ORDER BY table_name;

-- ตรวจสอบ Indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'pilots' 
AND schemaname = 'public'
ORDER BY indexname;

-- ตรวจสอบ Functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'check_license_expiry';
