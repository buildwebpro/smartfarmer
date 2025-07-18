import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  const { data, error } = await supabase.from("crop_types").select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  // Transform data to match frontend format
  const transformedData = data?.map(item => ({
    id: item.id,
    name: item.name,
    pricePerRai: item.price_per_rai
  })) || []
  
  return NextResponse.json({ data: transformedData })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, pricePerRai } = body
  const insertData = {
    name,
    price_per_rai: pricePerRai
  }
  const { data, error } = await supabase.from("crop_types").insert([insertData]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, name, pricePerRai } = body
  const updateData = {
    name,
    price_per_rai: pricePerRai
  }
  const { data, error } = await supabase.from("crop_types").update(updateData).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const { id } = body
  const { error } = await supabase.from("crop_types").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 