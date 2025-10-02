import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/proposals - Get proposals (filter by provider_id or job_id)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const providerId = searchParams.get('provider_id')
    const jobId = searchParams.get('job_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('proposals')
      .select(`
        *,
        job:job_postings (
          id,
          title,
          job_type,
          area_size,
          budget_min,
          budget_max,
          province,
          status,
          farmer:customers!job_postings_farmer_id_fkey (
            name,
            phone,
            avatar_url
          )
        ),
        provider:service_providers (
          id,
          avg_rating,
          total_jobs_completed,
          is_verified,
          user:customers!service_providers_user_id_fkey (
            name,
            phone,
            avatar_url,
            province
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (providerId) {
      query = query.eq('provider_id', providerId)
    }

    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching proposals:', error)
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
    console.error('Error in GET /api/proposals:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/proposals - Create new proposal
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      job_id,
      provider_id,
      price,
      estimated_duration,
      description,
      images
    } = body

    // Validate required fields
    if (!job_id || !provider_id || !price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if job is still open
    const { data: job } = await supabase
      .from('job_postings')
      .select('status')
      .eq('id', job_id)
      .single()

    if (!job || job.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'Job is not open for proposals' },
        { status: 400 }
      )
    }

    // Check if provider already submitted a proposal
    const { data: existing } = await supabase
      .from('proposals')
      .select('id')
      .eq('job_id', job_id)
      .eq('provider_id', provider_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You already submitted a proposal for this job' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        job_id,
        provider_id,
        price,
        estimated_duration,
        description,
        images,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating proposal:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Update proposal count on job
    await supabase.rpc('increment_proposal_count', { job_id })

    // TODO: Send notification to farmer

    return NextResponse.json({
      success: true,
      data,
      message: 'ส่งข้อเสนอเรียบร้อยแล้ว'
    })
  } catch (error) {
    console.error('Error in POST /api/proposals:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/proposals - Update proposal (accept/reject)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, status, job_id } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating proposal:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // If accepted, update job status and reject other proposals
    if (status === 'accepted' && job_id) {
      await supabase
        .from('job_postings')
        .update({
          status: 'in_progress',
          selected_proposal_id: id
        })
        .eq('id', job_id)

      // Reject other proposals
      await supabase
        .from('proposals')
        .update({ status: 'rejected' })
        .eq('job_id', job_id)
        .neq('id', id)
        .eq('status', 'pending')
    }

    // TODO: Send notifications

    return NextResponse.json({
      success: true,
      data,
      message: status === 'accepted' ? 'รับข้อเสนอเรียบร้อยแล้ว' : 'ปฏิเสธข้อเสนอแล้ว'
    })
  } catch (error) {
    console.error('Error in PATCH /api/proposals:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
