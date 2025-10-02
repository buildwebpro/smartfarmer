import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/jobs - Get all job postings
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const jobType = searchParams.get('job_type')
    const province = searchParams.get('province')
    const farmerId = searchParams.get('farmer_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('job_postings')
      .select(`
        *,
        farmer:customers!job_postings_farmer_id_fkey (
          id,
          name,
          phone,
          avatar_url,
          province
        ),
        proposals:proposals (count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (jobType) {
      query = query.eq('job_type', jobType)
    }

    if (province) {
      query = query.eq('province', province)
    }

    if (farmerId) {
      query = query.eq('farmer_id', farmerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0
    })
  } catch (error) {
    console.error('Error in GET /api/jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create new job posting
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      farmer_id,
      job_type,
      title,
      description,
      area_size,
      location,
      address,
      province,
      district,
      budget_min,
      budget_max,
      preferred_date,
      images
    } = body

    // Validate required fields
    if (!farmer_id || !job_type || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        farmer_id,
        job_type,
        title,
        description,
        area_size,
        location,
        address,
        province,
        district,
        budget_min,
        budget_max,
        preferred_date,
        images,
        status: 'open'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating job:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // TODO: Send notifications to nearby providers

    return NextResponse.json({
      success: true,
      data,
      message: 'งานถูกสร้างเรียบร้อยแล้ว'
    })
  } catch (error) {
    console.error('Error in POST /api/jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/jobs - Update job posting
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('job_postings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating job:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'อัปเดตงานเรียบร้อยแล้ว'
    })
  } catch (error) {
    console.error('Error in PATCH /api/jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
