-- Fix username constraint issue
-- Run this SQL in your Supabase dashboard

-- Option 1: Make username nullable (recommended)
ALTER TABLE admin_users ALTER COLUMN username DROP NOT NULL;

-- Option 2: Or set a default value for username
-- ALTER TABLE admin_users ALTER COLUMN username SET DEFAULT '';

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' AND column_name = 'username';
