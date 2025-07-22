-- Create simplified bookings table for drone service
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(50),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    area_size DECIMAL(10,2) NOT NULL,
    crop_type VARCHAR(100),
    spray_type VARCHAR(100),
    gps_coordinates TEXT,
    scheduled_date DATE,
    scheduled_time TIME DEFAULT '08:00:00',
    notes TEXT,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending_payment',
    line_user_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
