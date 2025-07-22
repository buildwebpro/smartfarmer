import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const notifications = []

    // 1. Check for drones needing maintenance
    const { data: drones, error: dronesError } = await supabase
      .from('drones')
      .select('id, name, next_maintenance, status')
      .not('next_maintenance', 'is', null)

    if (dronesError) {
      console.error('Error fetching drones:', dronesError)
    } else if (drones) {
      const today = new Date()
      const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000))

      drones.forEach(drone => {
        if (drone.next_maintenance) {
          const maintenanceDate = new Date(drone.next_maintenance)
          const daysDiff = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysDiff <= 3 && daysDiff >= 0) {
            notifications.push({
              id: `maintenance-${drone.id}`,
              type: 'warning',
              title: `โดรน ${drone.name} ต้องการการบำรุงรักษา`,
              message: daysDiff === 0 
                ? 'ครบกำหนดบำรุงรักษาวันนี้'
                : `ครบกำหนดบำรุงรักษาในอีก ${daysDiff} วัน`,
              createdAt: new Date().toISOString(),
              priority: daysDiff === 0 ? 'high' : 'medium'
            })
          }
        }
      })
    }

    // 2. Check for pending orders
    const { data: pendingOrders, error: ordersError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('status', 'pending_payment')

    if (ordersError) {
      console.error('Error fetching pending orders:', ordersError)
    } else if (pendingOrders && pendingOrders.length > 0) {
      notifications.push({
        id: 'pending-orders',
        type: 'info',
        title: `มีออร์เดอร์ใหม่ ${pendingOrders.length} รายการรอการยืนยัน`,
        message: 'กรุณาตรวจสอบและยืนยันออร์เดอร์',
        createdAt: new Date().toISOString(),
        priority: 'medium'
      })
    }

    // 3. Check for low battery drones
    const { data: lowBatteryDrones, error: batteryError } = await supabase
      .from('drones')
      .select('id, name, battery_level')
      .lt('battery_level', 30)
      .eq('status', 'available')

    if (batteryError) {
      console.error('Error fetching low battery drones:', batteryError)
    } else if (lowBatteryDrones && lowBatteryDrones.length > 0) {
      lowBatteryDrones.forEach(drone => {
        notifications.push({
          id: `battery-${drone.id}`,
          type: 'warning',
          title: `โดรน ${drone.name} แบตเตอรี่ต่ำ`,
          message: `แบตเตอรี่เหลือ ${drone.battery_level}% ควรชาร์จ`,
          createdAt: new Date().toISOString(),
          priority: drone.battery_level < 15 ? 'high' : 'medium'
        })
      })
    }

    // 4. Check for revenue growth (compared to last month)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const { data: currentMonthOrders, error: currentError } = await supabase
      .from('bookings')
      .select('total_price')
      .gte('created_at', new Date(currentYear, currentMonth, 1).toISOString())
      .lt('created_at', new Date(currentYear, currentMonth + 1, 1).toISOString())
      .eq('status', 'completed')

    const { data: lastMonthOrders, error: lastError } = await supabase
      .from('bookings')
      .select('total_price')
      .gte('created_at', new Date(lastMonthYear, lastMonth, 1).toISOString())
      .lt('created_at', new Date(lastMonthYear, lastMonth + 1, 1).toISOString())
      .eq('status', 'completed')

    if (!currentError && !lastError && currentMonthOrders && lastMonthOrders) {
      const currentRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.total_price || 0), 0)
      const lastRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.total_price || 0), 0)

      if (lastRevenue > 0) {
        const growthPercentage = ((currentRevenue - lastRevenue) / lastRevenue) * 100
        
        if (growthPercentage > 5) {
          notifications.push({
            id: 'revenue-growth',
            type: 'success',
            title: `ยอดขายเดือนนี้เพิ่มขึ้น ${Math.round(growthPercentage)}%`,
            message: 'เมื่อเทียบกับเดือนที่แล้ว',
            createdAt: new Date().toISOString(),
            priority: 'low'
          })
        }
      }
    }

    // Sort notifications by priority and creation time
    const priorityOrder = { high: 1, medium: 2, low: 3 }
    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({
      success: true,
      data: notifications.slice(0, 5), // Limit to 5 most important notifications
      total: notifications.length
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
