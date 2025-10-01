-- Add Equipment/Machinery System to Drone Booking Service
-- This extends the system to support various types of rental equipment

-- 1. Create equipment_categories table (ประเภทเครื่องจักร)
CREATE TABLE IF NOT EXISTS equipment_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- lucide icon name
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create equipment table (แทนที่จะมีแค่ drones)
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES equipment_categories(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    specifications JSONB, -- เก็บข้อมูล spec ต่างๆ เช่น {"capacity": "20L", "weight": "30kg"}
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'working', 'maintenance', 'repair', 'retired')),
    assigned_operator_id UUID REFERENCES pilots(id), -- ใช้ pilots table เป็น operators
    rental_price_per_day DECIMAL(10,2) NOT NULL,
    rental_price_per_hour DECIMAL(10,2),
    deposit_amount DECIMAL(10,2) NOT NULL,

    -- Equipment specific fields
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')),
    purchase_date DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    maintenance_interval_days INTEGER DEFAULT 30,
    operating_hours DECIMAL(10,2) DEFAULT 0,
    current_location VARCHAR(255),

    -- Media
    image_url VARCHAR(500),
    images JSONB, -- Array of image URLs

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update bookings table to support equipment rentals
-- Add new columns to existing bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_id UUID REFERENCES equipment(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'service' CHECK (booking_type IN ('service', 'rental'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rental_start_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rental_end_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rental_duration_days INTEGER;

-- 4. Create equipment_rental_rates table (อัตราค่าเช่าแบบยืดหยุ่น)
CREATE TABLE IF NOT EXISTS equipment_rental_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id) NOT NULL,
    rate_type VARCHAR(20) NOT NULL CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    price DECIMAL(10,2) NOT NULL,
    minimum_duration INTEGER, -- minimum hours/days required
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create equipment_maintenance_log table
CREATE TABLE IF NOT EXISTS equipment_maintenance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id) NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL, -- 'routine', 'repair', 'inspection'
    description TEXT NOT NULL,
    cost DECIMAL(10,2),
    performed_by VARCHAR(255),
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    next_maintenance_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Rename pilots table to operators (or keep pilots and add operators)
-- For backward compatibility, we'll keep pilots table and use it for both
ALTER TABLE pilots RENAME TO operators;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS operator_type VARCHAR(20) DEFAULT 'pilot' CHECK (operator_type IN ('pilot', 'operator', 'both'));

-- Update foreign key references
ALTER TABLE drones DROP CONSTRAINT IF EXISTS drones_assigned_pilot_id_fkey;
ALTER TABLE drones ADD CONSTRAINT drones_assigned_operator_id_fkey FOREIGN KEY (assigned_pilot_id) REFERENCES operators(id);

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_assigned_pilot_id_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_assigned_operator_id_fkey FOREIGN KEY (assigned_pilot_id) REFERENCES operators(id);

ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_assigned_operator_id_fkey;
ALTER TABLE equipment ADD CONSTRAINT equipment_assigned_operator_id_fkey FOREIGN KEY (assigned_operator_id) REFERENCES operators(id);

-- 7. Insert default equipment categories
INSERT INTO equipment_categories (name, description, icon, display_order) VALUES
('โดรนพ่นยา', 'โดรนสำหรับพ่นยาเกษตรอัตโนมัติ', 'Plane', 1),
('รถไถ', 'รถไถนาและเตรียมดิน', 'Tractor', 2),
('รถเกี่ยวข้าว', 'รถเกี่ยวนวดข้าวแบบนั่งขับและเดินตาม', 'Wheat', 3),
('เครื่องสูบน้ำ', 'ปั๊มน้ำและระบบชลประทาน', 'Droplets', 4),
('เครื่องปลูก', 'เครื่องจักรสำหรับการปลูกพืช', 'Sprout', 5),
('เครื่องตัดหญ้า', 'เครื่องตัดหญ้าและทำความสะอาด', 'Scissors', 6);

-- 8. Migrate existing drones to equipment table
INSERT INTO equipment (category_id, name, model, status, assigned_operator_id,
                       rental_price_per_day, rental_price_per_hour, deposit_amount,
                       last_maintenance, next_maintenance, current_location, operating_hours)
SELECT
    (SELECT id FROM equipment_categories WHERE name = 'โดรนพ่นยา' LIMIT 1),
    name,
    model,
    status,
    assigned_pilot_id,
    500.00, -- default rental price per day
    100.00, -- default rental price per hour
    1000.00, -- default deposit
    last_maintenance,
    next_maintenance,
    current_location,
    flight_hours
FROM drones
WHERE id NOT IN (SELECT id FROM equipment WHERE name LIKE 'โดรน%');

-- 9. Insert sample equipment
INSERT INTO equipment (category_id, name, model, brand, specifications,
                       rental_price_per_day, rental_price_per_hour, deposit_amount,
                       current_location, description)
VALUES
-- รถไถ
((SELECT id FROM equipment_categories WHERE name = 'รถไถ'),
 'รถไถ Kubota L4508', 'L4508', 'Kubota',
 '{"horsepower": "45 HP", "drive": "4WD", "transmission": "hydrostatic"}',
 1500.00, 300.00, 3000.00, 'ฐานหลัก',
 'รถไถ Kubota 45 แรงม้า ระบบ 4WD เหมาะสำหรับไถนาและทำสวน'),

((SELECT id FROM equipment_categories WHERE name = 'รถไถ'),
 'รถไถ Massey Ferguson 265', 'MF 265', 'Massey Ferguson',
 '{"horsepower": "60 HP", "drive": "2WD"}',
 1200.00, 250.00, 2500.00, 'ฐานหลัก',
 'รถไถ Massey Ferguson 60 แรงม้า เหมาะสำหรับงานไถนาขนาดใหญ่'),

-- รถเกี่ยวข้าว
((SELECT id FROM equipment_categories WHERE name = 'รถเกี่ยวข้าว'),
 'รถเกี่ยว Kubota DC70', 'DC70', 'Kubota',
 '{"type": "combine harvester", "cutting_width": "1.65m", "tank_capacity": "80kg"}',
 2500.00, 500.00, 5000.00, 'ฐานหลัก',
 'รถเกี่ยวข้าวแบบนั่งขับ กว้าง 1.65 เมตร ความจุถัง 80 กก.'),

((SELECT id FROM equipment_categories WHERE name = 'รถเกี่ยวข้าว'),
 'รถเกี่ยว Yanmar YH880', 'YH880', 'Yanmar',
 '{"type": "walking tractor harvester", "cutting_width": "0.8m"}',
 1000.00, 200.00, 2000.00, 'ฐานหลัก',
 'รถเกี่ยวข้าวแบบเดินตาม กว้าง 80 ซม. เหมาะสำหรับนาขนาดเล็ก'),

-- เครื่องสูบน้ำ
((SELECT id FROM equipment_categories WHERE name = 'เครื่องสูบน้ำ'),
 'ปั๊มน้ำ Honda WB30', 'WB30', 'Honda',
 '{"flow_rate": "1100 L/min", "power": "5.5 HP", "fuel": "gasoline"}',
 400.00, 80.00, 1000.00, 'ฐานหลัก',
 'ปั๊มน้ำเบนซิน Honda 3 นิ้ว อัตราการสูบ 1,100 ลิตร/นาที'),

((SELECT id FROM equipment_categories WHERE name = 'เครื่องสูบน้ำ'),
 'ปั๊มน้ำ Mitsubishi GB180', 'GB180', 'Mitsubishi',
 '{"flow_rate": "600 L/min", "power": "6 HP", "fuel": "diesel"}',
 450.00, 90.00, 1200.00, 'ฐานหลัก',
 'ปั๊มน้ำดีเซล Mitsubishi 3 นิ้ว ประหยัดน้ำมัน'),

-- เครื่องตัดหญ้า
((SELECT id FROM equipment_categories WHERE name = 'เครื่องตัดหญ้า'),
 'เครื่องตัดหญ้า Stihl FS 120', 'FS 120', 'Stihl',
 '{"power": "1.5 kW", "weight": "5.8kg", "type": "brush cutter"}',
 200.00, 50.00, 500.00, 'ฐานหลัก',
 'เครื่องตัดหญ้าสะพายหลัง Stihl เครื่องยนต์เบนซิน 2 จังหวะ'),

((SELECT id FROM equipment_categories WHERE name = 'เครื่องตัดหญ้า'),
 'เครื่องตัดหญ้า Makita DUR191', 'DUR191', 'Makita',
 '{"power": "18V", "battery": "5.0Ah", "type": "line trimmer"}',
 150.00, 40.00, 300.00, 'ฐานหลัก',
 'เครื่องตัดหญ้าแบตเตอรี่ Makita 18V ไม่มีเสียง ไม่มีควัน');

-- 10. Create indexes
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_is_active ON equipment(is_active);
CREATE INDEX idx_bookings_equipment ON bookings(equipment_id);
CREATE INDEX idx_bookings_type ON bookings(booking_type);
CREATE INDEX idx_equipment_rental_rates_equipment ON equipment_rental_rates(equipment_id);

-- 11. Create triggers
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_categories_updated_at BEFORE UPDATE ON equipment_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_rental_rates_updated_at BEFORE UPDATE ON equipment_rental_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Create view for available equipment
CREATE OR REPLACE VIEW available_equipment AS
SELECT
    e.*,
    ec.name as category_name,
    ec.icon as category_icon,
    o.name as operator_name
FROM equipment e
LEFT JOIN equipment_categories ec ON e.category_id = ec.id
LEFT JOIN operators o ON e.assigned_operator_id = o.id
WHERE e.is_active = true AND e.status = 'available';

COMMENT ON TABLE equipment IS 'เก็บข้อมูลเครื่องจักรและอุปกรณ์ทั้งหมดที่ให้เช่า';
COMMENT ON TABLE equipment_categories IS 'ประเภทของเครื่องจักร เช่น โดรน, รถไถ, รถเกี่ยวข้าว';
COMMENT ON TABLE equipment_rental_rates IS 'อัตราค่าเช่าแบบยืดหยุ่น รายชั่วโมง รายวัน รายสัปดาห์';
COMMENT ON TABLE equipment_maintenance_log IS 'บันทึกการบำรุงรักษาและซ่อมแซมเครื่องจักร';
