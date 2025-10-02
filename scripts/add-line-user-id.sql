-- Add LINE user ID column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) UNIQUE;

-- Create index for faster LINE user lookups
CREATE INDEX IF NOT EXISTS idx_customers_line_user_id ON customers(line_user_id);

-- Update the RLS policy to allow LINE authenticated users
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    -- Try to get user from JWT
    RETURN (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
