import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("pilots")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching pilots:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in GET /api/pilots:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, experience_years = 0, certifications = [], is_active = true } = body

    if (!name || !phone) {
      return NextResponse.json({ error: "ชื่อและเบอร์โทรเป็นข้อมูลที่จำเป็น" }, { status: 400 })
    }

    const insertData = {
      name,
      phone,
      experience_years,
      certifications,
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
    const { id, name, phone, experience_years, certifications, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID นักบิน" }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (experience_years !== undefined) updateData.experience_years = experience_years
    if (certifications !== undefined) updateData.certifications = certifications
    if (is_active !== undefined) updateData.is_active = is_active

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
