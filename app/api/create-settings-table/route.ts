import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for administrative operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST() {
  try {
    console.log('Creating settings table...')
    
    // First, try to create the table using raw SQL through RPC
    const createTableSQL = `
      -- Create settings table
      CREATE TABLE IF NOT EXISTS public.settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key VARCHAR(100) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          category VARCHAR(50) DEFAULT 'general',
          data_type VARCHAR(20) DEFAULT 'string',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
      CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category);

      -- Create trigger function for updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger
      DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
      CREATE TRIGGER update_settings_updated_at 
          BEFORE UPDATE ON public.settings 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `

    // Try to execute SQL using Supabase's built-in SQL execution
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: createTableSQL 
      })
      
      if (error) {
        console.log('RPC exec_sql not available, trying alternative method...')
        // If RPC is not available, continue to insert data directly
      } else {
        console.log('Table created successfully via RPC')
      }
    } catch (rpcError) {
      console.log('RPC method failed, continuing with direct insertion...')
    }

    // Insert default settings
    const defaultSettings = [
      { key: 'site_name', value: 'Drone Booking Service', description: 'ชื่อเว็บไซต์', category: 'general', data_type: 'string' },
      { key: 'site_description', value: 'บริการจองโดรนพ่นยาเกษตร', description: 'คำอธิบายเว็บไซต์', category: 'general', data_type: 'string' },
      { key: 'contact_email', value: 'admin@dronebooking.com', description: 'อีเมลติดต่อ', category: 'general', data_type: 'string' },
      { key: 'contact_phone', value: '02-123-4567', description: 'เบอร์โทรติดต่อ', category: 'general', data_type: 'string' },
      { key: 'email_notifications', value: 'true', description: 'แจ้งเตือนทางอีเมล', category: 'notifications', data_type: 'boolean' },
      { key: 'sms_notifications', value: 'false', description: 'แจ้งเตือนทาง SMS', category: 'notifications', data_type: 'boolean' },
      { key: 'push_notifications', value: 'true', description: 'แจ้งเตือนแบบ Push', category: 'notifications', data_type: 'boolean' },
      { key: 'max_bookings_per_day', value: '10', description: 'จำนวนการจองสูงสุดต่อวัน', category: 'system', data_type: 'number' },
      { key: 'booking_time_slots', value: '8', description: 'จำนวนช่วงเวลาการจอง', category: 'system', data_type: 'number' },
      { key: 'default_deposit', value: '1000', description: 'ยอดมัดจำเริ่มต้น (บาท)', category: 'system', data_type: 'number' },
      { key: 'default_language', value: 'th', description: 'ภาษาเริ่มต้น', category: 'system', data_type: 'string' },
      { key: 'primary_color', value: 'emerald', description: 'สีหลักของธีม', category: 'theme', data_type: 'string' },
      { key: 'dark_mode', value: 'false', description: 'โหมดมืด', category: 'theme', data_type: 'boolean' },
      { key: 'session_timeout', value: '30', description: 'เวลาหมดอายุ Session (นาที)', category: 'security', data_type: 'number' },
      { key: 'require_two_factor', value: 'false', description: 'การยืนยันตัวตน 2 ขั้นตอน', category: 'security', data_type: 'boolean' },
      { key: 'password_expiry', value: '90', description: 'วันหมดอายุรหัสผ่าน (วัน)', category: 'security', data_type: 'number' }
    ]

    console.log('Inserting default settings...')
    
    // Try to insert settings one by one to see what works
    const results = []
    let successCount = 0
    
    for (const setting of defaultSettings) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .upsert(setting, { 
            onConflict: 'key',
            ignoreDuplicates: false 
          })
          .select()
        
        if (error) {
          console.error(`Error inserting setting ${setting.key}:`, error)
          results.push({ 
            key: setting.key, 
            success: false, 
            error: error.message || 'Unknown error' 
          })
        } else {
          successCount++
          results.push({ key: setting.key, success: true })
        }
      } catch (insertError) {
        console.error(`Exception inserting setting ${setting.key}:`, insertError)
        results.push({ 
          key: setting.key, 
          success: false, 
          error: `Exception: ${insertError}` 
        })
      }
    }

    console.log(`Successfully inserted ${successCount}/${defaultSettings.length} settings`)

    if (successCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Failed to insert any settings. Table might not exist.',
        results,
        instructions: 'Please create the settings table manually using the SQL script in scripts/settings-schema.sql'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Settings table setup completed. ${successCount}/${defaultSettings.length} settings inserted.`,
      results,
      successCount,
      totalCount: defaultSettings.length
    })

  } catch (error) {
    console.error('Error in setup API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error),
        instructions: 'Please create the settings table manually using Supabase SQL Editor'
      },
      { status: 500 }
    )
  }
}
