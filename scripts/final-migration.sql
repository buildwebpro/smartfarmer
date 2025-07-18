-- Final migration steps
-- Run these commands one by one in Supabase SQL Editor

-- Step 1: Remove password_hash column (not needed for Supabase auth)
ALTER TABLE admin_users DROP COLUMN password_hash;

-- Step 2: Add foreign key constraint
ALTER TABLE admin_users ADD CONSTRAINT admin_users_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Verify final structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;
