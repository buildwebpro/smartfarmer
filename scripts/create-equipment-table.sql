-- Create equipment table only
-- This is a simplified version to create just the equipment table

CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES equipment_categories(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    specifications JSONB,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'working', 'maintenance', 'repair', 'retired')),
    assigned_operator_id UUID,
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
    images JSONB,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_is_active ON equipment(is_active);

-- Enable Row Level Security
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Create policies for equipment table
-- Allow public to read active equipment
CREATE POLICY "Allow public read access to active equipment"
ON equipment FOR SELECT
USING (is_active = true);

-- Allow authenticated users to read all equipment
CREATE POLICY "Allow authenticated users to read all equipment"
ON equipment FOR SELECT
TO authenticated
USING (true);

-- Allow service role to do everything
CREATE POLICY "Allow service role full access to equipment"
ON equipment FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE equipment IS 'เก็บข้อมูลเครื่องจักรและอุปกรณ์ทั้งหมดที่ให้เช่า';
