import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("drones")
      .select(`
        *,
        assigned_pilot:pilots(name, phone, experience_years)
      `)
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching drones:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Transform data to match frontend format
    const transformedData = data?.map(drone => ({
      id: drone.id,
      name: drone.name,
      model: drone.model,
      status: drone.status,
      assignedPilot: drone.assigned_pilot?.name || null,
      assignedPilotId: drone.assigned_pilot_id,
      batteryLevel: drone.battery_level,
      flightHours: drone.flight_hours,
      lastMaintenance: drone.last_maintenance,
      nextMaintenance: drone.next_maintenance,
      location: drone.current_location,
      isActive: drone.is_active
    })) || []
    
    return NextResponse.json({ data: transformedData })
  } catch (error) {
    console.error("Error in drones GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      model, 
      status, 
      assignedPilotId, 
      batteryLevel, 
      flightHours, 
      lastMaintenance, 
      nextMaintenance, 
      location 
    } = body

    const insertData = {
      name,
      model,
      status: status || 'available',
      assigned_pilot_id: assignedPilotId || null,
      battery_level: batteryLevel || 100,
      flight_hours: flightHours || 0,
      last_maintenance: lastMaintenance || null,
      next_maintenance: nextMaintenance || null,
      current_location: location || 'ฐานหลัก',
      is_active: true
    }

    const { data, error } = await supabase
      .from("drones")
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error("Error adding drone:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in drones POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      name, 
      model, 
      status, 
      assignedPilotId, 
      batteryLevel, 
      flightHours, 
      lastMaintenance, 
      nextMaintenance, 
      location 
    } = body

    const updateData = {
      name,
      model,
      status,
      assigned_pilot_id: assignedPilotId || null,
      battery_level: batteryLevel,
      flight_hours: flightHours,
      last_maintenance: lastMaintenance,
      next_maintenance: nextMaintenance,
      current_location: location
    }

    const { data, error } = await supabase
      .from("drones")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating drone:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in drones PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    const { error } = await supabase
      .from("drones")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting drone:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Drone deleted successfully" })
  } catch (error) {
    console.error("Error in drones DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
