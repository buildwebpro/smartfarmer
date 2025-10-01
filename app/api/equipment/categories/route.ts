import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { verifyAdminAuth, unauthorizedResponse } from "@/lib/auth-helpers"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("equipment_categories")
      .select("*")
      .eq('is_active', true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching equipment categories:", error)
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching equipment categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Require admin authentication
  const user = await verifyAdminAuth(request)
  if (!user) {
    return unauthorizedResponse("Admin access required")
  }

  try {
    const body = await request.json()
    const { name, description, icon, display_order } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("equipment_categories")
      .insert([{ name, description, icon, display_order }])
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // Require admin authentication
  const user = await verifyAdminAuth(request)
  if (!user) {
    return unauthorizedResponse("Admin access required")
  }

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("equipment_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating category:", error)
      return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}
