import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // ดึงข้อมูลการจองของผู้ใช้คนนี้
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("line_user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      message: `พบการจอง ${data?.length || 0} รายการ`
    })
    
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return NextResponse.json({ 
      error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
