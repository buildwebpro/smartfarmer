-- Simple Database Migration for admin_users table
-- Run this SQL in your Supabase dashboard SQL editor
-- Note: Some commands might give errors if columns/constraints already exist - that's okay!

-- Step 1: Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;

-- Step 2: Add user_id column (THE MOST IMPORTANT STEP!)
ALTER TABLE admin_users ADD COLUMN user_id UUID UNIQUE;

-- Step 3: Add full_name column
ALTER TABLE admin_users ADD COLUMN full_name VARCHAR(255);

-- Step 4: Remove password_hash column (ignore error if column doesn't exist)
ALTER TABLE admin_users DROP COLUMN password_hash;

-- Step 5: Add foreign key constraint (ignore error if constraint already exists)
ALTER TABLE admin_users ADD CONSTRAINT admin_users_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 6: Verify the updated structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    table_name
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;

-- Step 7: Check constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'admin_users'::regclass;
