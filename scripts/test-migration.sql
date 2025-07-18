-- Test script to verify admin_users table structure after migration
-- Run this after running the migration

-- 1. Check if user_id column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_users' AND column_name = 'user_id'
        ) THEN '✓ user_id column exists'
        ELSE '✗ user_id column missing'
    END as user_id_check;

-- 2. Check if full_name column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_users' AND column_name = 'full_name'
        ) THEN '✓ full_name column exists'
        ELSE '✗ full_name column missing'
    END as full_name_check;

-- 3. Check if password_hash column is removed
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_users' AND column_name = 'password_hash'
        ) THEN '✓ password_hash column removed'
        ELSE '✗ password_hash column still exists'
    END as password_hash_check;

-- 4. Check foreign key constraint
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'admin_users' AND constraint_name = 'admin_users_user_id_fkey'
        ) THEN '✓ Foreign key constraint exists'
        ELSE '✗ Foreign key constraint missing'
    END as fk_check;

-- 5. Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;
