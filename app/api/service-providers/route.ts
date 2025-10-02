import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/service-providers - Get all service providers
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const serviceType = searchParams.get('service_type')
    const province = searchParams.get('province')
    const verified = searchParams.get('verified')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('service_providers')
      .select(`
        *,
        user:customers!service_providers_user_id_fkey (
          id,
          name,
          phone,
          avatar_url,
          province,
          district,
          verified
        )
      `)
      .order('avg_rating', { ascending: false })
      .limit(limit)

    if (serviceType) {
      query = query.contains('service_types', [serviceType])
    }

    if (province) {
      query = query.eq('user.province', province)
    }

    if (verified === 'true') {
      query = query.eq('is_verified', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching providers:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Error in GET /api/service-providers:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/service-providers - Create provider profile
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      user_id,
      service_types,
      hourly_rate,
      daily_rate,
      coverage_area,
      certifications,
      portfolio_images,
      years_experience,
      bio
    } = body

    if (!user_id || !service_types || service_types.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('service_providers')
      .insert({
        user_id,
        service_types,
        hourly_rate,
        daily_rate,
        coverage_area,
        certifications,
        portfolio_images,
        years_experience,
        bio
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating provider:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Update user role
    await supabase
      .from('customers')
      .update({ role: 'provider' })
      .eq('id', user_id)

    return NextResponse.json({
      success: true,
      data,
      message: 'สร้างโปรไฟล์ผู้ให้บริการเรียบร้อยแล้ว'
    })
  } catch (error) {
    console.error('Error in POST /api/service-providers:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/service-providers - Update provider profile
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('service_providers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating provider:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'อัปเดตโปรไฟล์เรียบร้อยแล้ว'
    })
  } catch (error) {
    console.error('Error in PATCH /api/service-providers:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
