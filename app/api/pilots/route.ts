import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  try {
    console.log('[Pilots API] Fetching pilots...')

    const { data, error } = await supabase
      .from("pilots")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[Pilots API] Supabase error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    console.log('[Pilots API] Query successful, count:', data?.length || 0)

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error: any) {
    console.error("[Pilots API] Exception:", error)
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal server error",
      details: error
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      phone, 
      email,
      line_id,
      address,
      birth_date,
      gender,
      national_id,
      uas_license_no,
      uas_license_expiry,
      experience_years = 0, 
      total_flight_hours = 0,
      agricultural_hours = 0,
      projects_completed = 0,
      status = "available",
      health_status,
      safety_score = 100,
      certifications = [], 
      special_certificates = [],
      is_active = true 
    } = body

    if (!name || !phone) {
      return NextResponse.json({ error: "ชื่อและเบอร์โทรเป็นข้อมูลที่จำเป็น" }, { status: 400 })
    }

    const insertData = {
      name,
      phone,
      email,
      line_id,
      address,
      birth_date: birth_date || null,
      gender,
      national_id,
      uas_license_no,
      uas_license_expiry: uas_license_expiry || null,
      experience_years,
      total_flight_hours,
      agricultural_hours,
      projects_completed,
      status,
      health_status,
      safety_score,
      certifications,
      special_certificates,
      is_active
    }

    const { data, error } = await supabase
      .from("pilots")
      .insert([insertData])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating pilot:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in POST /api/pilots:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      name, 
      phone, 
      email,
      line_id,
      address,
      birth_date,
      gender,
      national_id,
      uas_license_no,
      uas_license_expiry,
      experience_years, 
      total_flight_hours,
      agricultural_hours,
      projects_completed,
      status,
      health_status,
      safety_score,
      certifications,
      is_active,
      emergency_contact,
      emergency_phone,
      last_medical_check,
      specializations,
      notes
    } = body

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID นักบิน" }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (line_id !== undefined) updateData.line_id = line_id
    if (address !== undefined) updateData.address = address
    if (birth_date !== undefined) updateData.birth_date = birth_date
    if (gender !== undefined) updateData.gender = gender
    if (national_id !== undefined) updateData.national_id = national_id
    if (uas_license_no !== undefined) updateData.uas_license_no = uas_license_no
    if (uas_license_expiry !== undefined) updateData.uas_license_expiry = uas_license_expiry
    if (experience_years !== undefined) updateData.experience_years = experience_years
    if (total_flight_hours !== undefined) updateData.total_flight_hours = total_flight_hours
    if (agricultural_hours !== undefined) updateData.agricultural_hours = agricultural_hours
    if (projects_completed !== undefined) updateData.projects_completed = projects_completed
    if (status !== undefined) updateData.status = status
    if (health_status !== undefined) updateData.health_status = health_status
    if (safety_score !== undefined) updateData.safety_score = safety_score
    if (certifications !== undefined) updateData.certifications = certifications
    if (is_active !== undefined) updateData.is_active = is_active
    if (emergency_contact !== undefined) updateData.emergency_contact = emergency_contact
    if (emergency_phone !== undefined) updateData.emergency_phone = emergency_phone
    if (last_medical_check !== undefined) updateData.last_medical_check = last_medical_check
    if (specializations !== undefined) updateData.specializations = specializations
    if (notes !== undefined) updateData.notes = notes
    if (emergency_contact !== undefined) updateData.emergency_contact = emergency_contact
    if (emergency_phone !== undefined) updateData.emergency_phone = emergency_phone

    const { data, error } = await supabase
      .from("pilots")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating pilot:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in PUT /api/pilots:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID นักบิน" }, { status: 400 })
    }

    // Check if pilot is assigned to any drones
    const { data: assignedDrones } = await supabase
      .from("drones")
      .select("id, name")
      .eq("assigned_pilot_id", id)

    if (assignedDrones && assignedDrones.length > 0) {
      const droneNames = assignedDrones.map(d => d.name).join(", ")
      return NextResponse.json({ 
        error: `ไม่สามารถลบนักบินได้ เนื่องจากยังมีโดรนที่ได้รับมอบหมาย: ${droneNames}` 
      }, { status: 400 })
    }

    // Check if pilot has any bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("pilot_id", id)

    if (bookings && bookings.length > 0) {
      return NextResponse.json({ 
        error: `ไม่สามารถลบนักบินได้ เนื่องจากยังมีการจองที่เกี่ยวข้อง (${bookings.length} รายการ)` 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from("pilots")
      .delete()
      .eq("id", id)
    
    if (error) {
      console.error("Error deleting pilot:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/pilots:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
