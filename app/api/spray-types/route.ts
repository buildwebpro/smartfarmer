import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  const { data, error } = await supabase.from("spray_types").select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { data, error } = await supabase.from("spray_types").insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updateData } = body
  const { data, error } = await supabase.from("spray_types").update(updateData).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const { id } = body
  const { error } = await supabase.from("spray_types").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 