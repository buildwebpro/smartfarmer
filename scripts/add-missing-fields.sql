-- เพิ่มฟิลด์ที่หายไปในตาราง pilots
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS specializations TEXT;
