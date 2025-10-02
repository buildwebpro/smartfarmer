import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/jobs/[id] - Get single job with details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const jobId = params.id

    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        farmer:customers!job_postings_farmer_id_fkey (
          id,
          name,
          phone,
          avatar_url,
          province,
          district
        ),
        proposals:proposals (
          id,
          price,
          estimated_duration,
          description,
          status,
          created_at,
          provider:service_providers (
            id,
            user_id,
            avg_rating,
            total_jobs_completed,
            total_reviews,
            certifications,
            is_verified,
            user:customers!service_providers_user_id_fkey (
              name,
              phone,
              avatar_url,
              province
            )
          )
        )
      `)
      .eq('id', jobId)
      .single()

    if (error) {
      console.error('Error fetching job:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await supabase
      .from('job_postings')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', jobId)

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error in GET /api/jobs/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/[id] - Cancel/Delete job
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const jobId = params.id

    const { error } = await supabase
      .from('job_postings')
      .update({ status: 'cancelled' })
      .eq('id', jobId)

    if (error) {
      console.error('Error cancelling job:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'ยกเลิกงานเรียบร้อยแล้ว'
    })
  } catch (error) {
    console.error('Error in DELETE /api/jobs/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
