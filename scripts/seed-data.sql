-- Seed data for drone booking service
-- Insert initial crop types
INSERT INTO crop_types (id, name, price_per_rai) VALUES 
('rice', 'ข้าว', 300),
('corn', 'ข้าวโพด', 350),
('sugarcane', 'อ้อย', 400),
('cassava', 'มันสำปะหลัง', 320),
('rubber', 'ยางพารา', 380)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price_per_rai = EXCLUDED.price_per_rai;

-- Insert initial spray types
INSERT INTO spray_types (id, name, price_per_rai, description) VALUES 
('herbicide', 'ยาฆ่าหญ้า', 100, 'สำหรับกำจัดวัชพืช'),
('insecticide', 'ยาฆ่าแมลง', 150, 'สำหรับป้องกันแมลงศัตรูพืช'),
('fertilizer', 'ปุ่ยเหลว', 200, 'สำหรับเสริมธาตุอาหารพืช'),
('fungicide', 'ยาฆ่าเชื้อรา', 180, 'สำหรับป้องกันโรคพืช')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price_per_rai = EXCLUDED.price_per_rai,
  description = EXCLUDED.description;
