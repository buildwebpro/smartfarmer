import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { verifyAdminAuth, unauthorizedResponse } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  try {
    console.log('[Equipment API] Fetching equipment...')

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    let query = supabase
      .from("equipment")
      .select(`
        *,
        category:equipment_categories(id, name, icon)
      `)
      .eq('is_active', true)
      .order("name", { ascending: true })

    if (category) {
      query = query.eq('category_id', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    console.log('[Equipment API] Executing query...')
    const { data, error } = await query

    if (error) {
      console.error("[Equipment API] Supabase error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    console.log('[Equipment API] Query successful, count:', data?.length || 0)

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error("[Equipment API] Exception:", error)
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to fetch equipment",
      details: error
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Require admin authentication for creating equipment
  const user = await verifyAdminAuth(request)
  if (!user) {
    return unauthorizedResponse("Admin access required")
  }

  try {
    const body = await request.json()

    const {
      category_id,
      name,
      model,
      brand,
      description,
      specifications,
      rental_price_per_day,
      rental_price_per_hour,
      deposit_amount,
      current_location,
      image_url,
    } = body

    // Validate required fields
    if (!category_id || !name || !model || !rental_price_per_day || !deposit_amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("equipment")
      .insert([
        {
          category_id,
          name,
          model,
          brand,
          description,
          specifications,
          rental_price_per_day: parseFloat(rental_price_per_day),
          rental_price_per_hour: rental_price_per_hour ? parseFloat(rental_price_per_hour) : null,
          deposit_amount: parseFloat(deposit_amount),
          current_location,
          image_url,
          status: 'available',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating equipment:", error)
      return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error creating equipment:", error)
    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // Require admin authentication for updating equipment
  const user = await verifyAdminAuth(request)
  if (!user) {
    return unauthorizedResponse("Admin access required")
  }

  try {
    console.log('[Equipment API] Updating equipment...')

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Equipment ID is required"
      }, { status: 400 })
    }

    console.log('[Equipment API] Updating equipment ID:', id, 'with:', updates)

    // Convert price fields to numbers if present
    if (updates.rental_price_per_day) {
      updates.rental_price_per_day = parseFloat(updates.rental_price_per_day)
    }
    if (updates.rental_price_per_hour) {
      updates.rental_price_per_hour = parseFloat(updates.rental_price_per_hour)
    }
    if (updates.deposit_amount) {
      updates.deposit_amount = parseFloat(updates.deposit_amount)
    }

    const { data, error } = await supabase
      .from("equipment")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[Equipment API] Error updating equipment:", error)
      return NextResponse.json({
        success: false,
        error: error.message || "Failed to update equipment"
      }, { status: 500 })
    }

    console.log('[Equipment API] Equipment updated successfully')

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error("[Equipment API] Exception:", error)
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to update equipment"
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  // Require admin authentication for deleting equipment
  const user = await verifyAdminAuth(request)
  if (!user) {
    return unauthorizedResponse("Admin access required")
  }

  try {
    console.log('[Equipment API] Deleting equipment...')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Equipment ID is required"
      }, { status: 400 })
    }

    console.log('[Equipment API] Deleting equipment ID:', id)

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from("equipment")
      .update({ is_active: false })
      .eq("id", id)

    if (error) {
      console.error("[Equipment API] Error deleting equipment:", error)
      return NextResponse.json({
        success: false,
        error: error.message || "Failed to delete equipment"
      }, { status: 500 })
    }

    console.log('[Equipment API] Equipment deleted successfully')

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error("[Equipment API] Exception:", error)
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to delete equipment"
    }, { status: 500 })
  }
}
