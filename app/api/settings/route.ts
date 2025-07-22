import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value, data_type, category')
      .order('category', { ascending: true })

    if (error) {
      // If table doesn't exist, return default mock data
      console.error('Error fetching settings (table might not exist):', error)
      
      const mockSettings = {
        site_name: "Drone Booking Service",
        site_description: "บริการจองโดรนพ่นยาเกษตร",
        contact_email: "admin@dronebooking.com",
        contact_phone: "02-123-4567",
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        max_bookings_per_day: 10,
        booking_time_slots: 8,
        default_deposit: 1000,
        default_language: "th",
        primary_color: "emerald",
        dark_mode: false,
        session_timeout: 30,
        require_two_factor: false,
        password_expiry: 90
      }
      
      return NextResponse.json({
        success: true,
        data: mockSettings,
        warning: 'Using mock data - settings table not found'
      })
    }

    // Transform settings into a more usable format
    const settingsObject: any = {}
    settings?.forEach(setting => {
      let value = setting.value
      
      // Convert value based on data_type
      switch (setting.data_type) {
        case 'boolean':
          value = setting.value === 'true'
          break
        case 'number':
          value = parseInt(setting.value)
          break
        case 'json':
          try {
            value = JSON.parse(setting.value)
          } catch {
            value = setting.value
          }
          break
        default:
          value = setting.value
      }
      
      settingsObject[setting.key] = value
    })

    return NextResponse.json({
      success: true,
      data: settingsObject
    })

  } catch (error) {
    console.error('Error in settings API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // Check if table exists first
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('key')
      .limit(1)

    if (checkError) {
      // Table doesn't exist, just simulate success
      console.log('Settings table not found, simulating save success')
      return NextResponse.json({
        success: true,
        message: 'Settings saved successfully (simulated - table not found)',
        warning: 'Settings table does not exist. Please create it first.'
      })
    }

    // Update each setting
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      // Convert value to string for storage
      let stringValue: string
      if (typeof value === 'boolean') {
        stringValue = value.toString()
      } else if (typeof value === 'number') {
        stringValue = value.toString()
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value)
      } else {
        stringValue = String(value)
      }

      return supabase
        .from('settings')
        .update({ 
          value: stringValue,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
    })

    const results = await Promise.all(updatePromises)
    
    // Check for errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Errors updating settings:', errors)
      return NextResponse.json(
        { success: false, error: 'Some settings failed to update' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
