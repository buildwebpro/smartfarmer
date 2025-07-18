-- Migration to fix admin_users table structure
-- This script adds the missing user_id column and updates the table structure

-- Step 1: Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN user_id UUID UNIQUE;
    END IF;
END
$$;

-- Step 2: Add full_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN full_name VARCHAR(255);
    END IF;
END
$$;

-- Step 3: Remove password_hash column if it exists (not needed for Supabase auth)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE admin_users DROP COLUMN password_hash;
    END IF;
END
$$;

-- Step 4: Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'admin_users' AND constraint_name = 'admin_users_user_id_fkey'
    ) THEN
        ALTER TABLE admin_users ADD CONSTRAINT admin_users_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Step 5: Update existing records if needed (this is a template, adjust based on your data)
-- You might need to manually set user_id values for existing records
-- UPDATE admin_users SET user_id = /* appropriate auth user id */ WHERE user_id IS NULL;

-- Step 6: Make user_id NOT NULL after setting values
-- ALTER TABLE admin_users ALTER COLUMN user_id SET NOT NULL;

-- Display current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;
