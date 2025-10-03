-- Add 3 demo equipment items

-- Insert demo equipment
INSERT INTO equipment (
    category_id,
    name,
    model,
    brand,
    description,
    specifications,
    status,
    rental_price_per_day,
    rental_price_per_hour,
    deposit_amount,
    current_location,
    condition
)
VALUES
-- 1. รถไถ Kubota
(
    (SELECT id FROM equipment_categories WHERE name = 'รถไถ' LIMIT 1),
    'รถไถ Kubota L4508',
    'L4508',
    'Kubota',
    'รถไถ Kubota 45 แรงม้า ระบบ 4WD เหมาะสำหรับไถนาและทำสวน มีระบบส่งกำลังแบบ Hydrostatic ใช้งานง่าย เหมาะสำหรับพื้นที่ 5-20 ไร่',
    '{"horsepower": "45 HP", "drive": "4WD", "transmission": "hydrostatic", "weight": "1800kg", "fuel_tank": "38L"}',
    'available',
    1500.00,
    300.00,
    3000.00,
    'ฐานหลัก นครราชสีมา',
    'excellent'
),

-- 2. รถเกี่ยวข้าว Kubota
(
    (SELECT id FROM equipment_categories WHERE name = 'รถเกี่ยวข้าว' LIMIT 1),
    'รถเกี่ยวข้าว Kubota DC70',
    'DC70',
    'Kubota',
    'รถเกี่ยวข้าวแบบนั่งขับ กว้างตัด 1.65 เมตร ความจุถังข้าวเปลือก 80 กก. มีระบบ HST ขับเคลื่อนง่าย เหมาะสำหรับนาขนาด 10-50 ไร่',
    '{"type": "combine harvester", "cutting_width": "1.65m", "tank_capacity": "80kg", "engine": "diesel", "fuel_efficiency": "excellent"}',
    'available',
    2500.00,
    500.00,
    5000.00,
    'ฐานหลัก นครราชสีมา',
    'good'
),

-- 3. ปั๊มน้ำ Honda
(
    (SELECT id FROM equipment_categories WHERE name = 'เครื่องสูบน้ำ' LIMIT 1),
    'ปั๊มน้ำ Honda WB30',
    'WB30',
    'Honda',
    'ปั๊มน้ำเบนซิน Honda 3 นิ้ว อัตราการสูบ 1,100 ลิตร/นาที ยกน้ำได้สูง 26 เมตร เครื่องยนต์ 5.5 แรงม้า ประหยัดน้ำมัน เหมาะสำหรับการสูบน้ำเข้านา',
    '{"flow_rate": "1100 L/min", "power": "5.5 HP", "fuel": "gasoline", "max_head": "26m", "inlet_outlet": "3 inch"}',
    'available',
    400.00,
    80.00,
    1000.00,
    'ฐานหลัก นครราชสีมา',
    'excellent'
);
