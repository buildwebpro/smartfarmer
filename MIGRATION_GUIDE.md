# Database Migration Guide

## Problem
The admin_users table is missing the `user_id` column that the API expects. The error "Could not find the 'user_id' column of 'admin_users' in the schema cache" occurs because the database schema doesn't match the API code.

## Solution Steps

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor

### Step 2: Run the Migration
Copy and paste the content from `scripts/manual-migration.sql` into the SQL editor and run it.

### Step 3: Verify Migration
After running the migration, copy and paste the content from `scripts/test-migration.sql` to verify everything is working correctly.

## What the Migration Does

1. **Adds `user_id` column**: Links admin_users to auth.users
2. **Adds `full_name` column**: Stores user's full name
3. **Removes `password_hash` column**: Not needed since we use Supabase auth
4. **Adds foreign key constraint**: Ensures data integrity

## Expected Table Structure After Migration

```sql
Column Name      | Data Type | Nullable | Description
-----------------|-----------|----------|-------------
id               | UUID      | NO       | Primary key
user_id          | UUID      | YES      | Foreign key to auth.users
username         | VARCHAR   | NO       | Username
email            | VARCHAR   | NO       | Email address
full_name        | VARCHAR   | YES      | Full name
role             | VARCHAR   | YES      | User role (admin/operator)
is_active        | BOOLEAN   | YES      | Active status
last_login       | TIMESTAMP | YES      | Last login time
created_at       | TIMESTAMP | YES      | Created timestamp
updated_at       | TIMESTAMP | YES      | Updated timestamp
```

## After Migration

Once you've run the migration successfully, the admin user management system should work properly without the "user_id column not found" error.

## Troubleshooting

If you encounter any issues:
1. Check that your Supabase project has the proper permissions
2. Verify that the auth.users table exists
3. Run the test script to verify the migration was successful
4. Check the browser console for any additional error messages
