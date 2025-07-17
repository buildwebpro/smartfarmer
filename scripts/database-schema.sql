-- Database schema for Drone Spraying Service SaaS
-- This script creates the necessary tables for the system

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    line_user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crop_types table (configurable by admin)
CREATE TABLE IF NOT EXISTS crop_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price_per_rai DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spray_types table (configurable by admin)
CREATE TABLE IF NOT EXISTS spray_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price_per_rai DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pilots table
CREATE TABLE IF NOT EXISTS pilots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    experience_years INTEGER DEFAULT 0,
    certifications TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drones table
CREATE TABLE IF NOT EXISTS drones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'working', 'maintenance', 'repair')),
    assigned_pilot_id UUID REFERENCES pilots(id),
    battery_level INTEGER DEFAULT 100,
    flight_hours DECIMAL(10,2) DEFAULT 0,
    last_maintenance DATE,
    next_maintenance DATE,
    current_location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    area_size DECIMAL(10,2) NOT NULL,
    crop_type_id UUID REFERENCES crop_types(id),
    spray_type_id UUID REFERENCES spray_types(id),
    gps_coordinates VARCHAR(100),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'assigned', 'in_progress', 'completed', 'cancelled')),
    assigned_drone_id UUID REFERENCES drones(id),
    assigned_pilot_id UUID REFERENCES pilots(id),
    notes TEXT,
    payment_slip_url VARCHAR(500),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_history table for status tracking
CREATE TABLE IF NOT EXISTS booking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    changed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    type VARCHAR(50) NOT NULL, -- 'booking_confirmed', 'payment_received', 'reminder', 'completed'
    recipient_type VARCHAR(20) NOT NULL, -- 'customer', 'admin', 'pilot'
    recipient_id VARCHAR(100), -- LINE user ID or admin ID
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'operator')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default crop types
INSERT INTO crop_types (name, price_per_rai) VALUES
('ข้าว', 50.00),
('อ้อย', 70.00),
('ทุเรียน', 100.00),
('มันสำปะหลัง', 70.00),
('ข้าวโพด', 60.00),
('ปาล์มน้ำมัน', 80.00);

-- Insert default spray types
INSERT INTO spray_types (name, price_per_rai) VALUES
('ปุ๋ย', 100.00),
('ฮอร์โมน', 150.00),
('ยาฆ่าหญ้า', 200.00),
('ยาฆ่าแมลง', 180.00),
('ยาป้องกันโรคพืช', 160.00);

-- Insert sample pilots
INSERT INTO pilots (name, phone, experience_years, certifications) VALUES
('นายสมศักดิ์ บินเก่ง', '081-111-1111', 3, ARRAY['ใบอนุญาตนักบินโดรน', 'การพ่นยาเกษตร']),
('นายวิชัย เก่งมาก', '082-222-2222', 5, ARRAY['ใบอนุญาตนักบินโดรน', 'การพ่นยาเกษตร', 'ความปลอดภัย']),
('นายประยุทธ์ ใจดี', '083-333-3333', 2, ARRAY['ใบอนุญาตนักบินโดรน']);

-- Insert sample drones
INSERT INTO drones (name, model, assigned_pilot_id, last_maintenance, next_maintenance, current_location) VALUES
('โดรน #1', 'DJI Agras T30', (SELECT id FROM pilots WHERE name = 'นายสมศักดิ์ บินเก่ง'), '2024-01-15', '2024-02-15', 'ฐานหลัก'),
('โดรน #2', 'DJI Agras T30', (SELECT id FROM pilots WHERE name = 'นายวิชัย เก่งมาก'), '2024-01-10', '2024-02-10', 'ฐานหลัก'),
('โดรน #3', 'DJI Agras T20', (SELECT id FROM pilots WHERE name = 'นายประยุทธ์ ใจดี'), '2024-01-18', '2024-01-20', 'ศูนย์บำรุงรักษา'),
('โดรน #4', 'DJI Agras T30', NULL, '2024-01-12', '2024-02-12', 'ฐานหลัก'),
('โดรน #5', 'DJI Agras T20', NULL, '2024-01-08', '2024-02-08', 'ฐานหลัก'),
('โดรน #6', 'DJI Agras T30', NULL, '2024-01-20', '2024-02-20', 'ฐานหลัก');

-- Create indexes for better performance
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX idx_drones_status ON drones(status);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_booking_history_booking_id ON booking_history(booking_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_types_updated_at BEFORE UPDATE ON crop_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spray_types_updated_at BEFORE UPDATE ON spray_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilots_updated_at BEFORE UPDATE ON pilots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drones_updated_at BEFORE UPDATE ON drones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
