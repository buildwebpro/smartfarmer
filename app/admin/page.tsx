"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModernDashboardStats } from "@/components/modern-dashboard-stats"
import { ModernQuickActions } from "@/components/modern-quick-actions"
import { ModernRecentOrders } from "@/components/modern-recent-orders"
import ProtectedRoute from "@/components/protected-route"
import { 
  Calendar, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  Users
} from "lucide-react"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalArea: number
  activeOrders: number
  availableDrones: number
  completedToday: number
  totalCustomers: number
  averageOrderValue: number
}

interface Order {
  id: string
  customerName: string
  phoneNumber: string
  areaSize: number
  cropType: string
  sprayType: string
  totalPrice: number
  depositAmount: number
  status: "pending_payment" | "paid" | "assigned" | "completed" | "cancelled"
  scheduledDate: string
  scheduledTime: string
  createdAt: string
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalArea: 0,
    activeOrders: 0,
    availableDrones: 6,
    completedToday: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  })

  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [currentDate, setCurrentDate] = useState<string>("")
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [isFetching, setIsFetching] = useState(false)

  // Cache data for 30 seconds เพื่อลดการเรียก API บ่อยๆ
  const CACHE_DURATION = 30000 // 30 วินาที

  // ✅ ตั้งค่าวันที่ปัจจุบันหลังจาก component mount เพื่อป้องกัน hydration error
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("th-TH", { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/admin/login")
      return
    }
    
    if (user) {
      fetchDashboardData()
    }
  }, [user, isLoading, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from APIs
      const [bookingsResponse, dronesResponse] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/drones')
      ])

      let totalOrders = 0
      let totalRevenue = 0
      let totalArea = 0
      let activeOrders = 0
      let completedToday = 0
      let recentOrdersList: Order[] = []

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        if (bookingsData.success && bookingsData.data) {
          const bookings = bookingsData.data
          
          totalOrders = bookings.length
          totalRevenue = bookings.reduce((sum: number, booking: any) => sum + (booking.total_price || 0), 0)
          totalArea = bookings.reduce((sum: number, booking: any) => sum + (booking.area_size || 0), 0)
          activeOrders = bookings.filter((b: any) => ['paid', 'assigned'].includes(b.status)).length
          
          // Get orders completed today
          const today = new Date().toISOString().split('T')[0]
          completedToday = bookings.filter((b: any) => 
            b.status === 'completed' && b.updated_at?.startsWith(today)
          ).length

          // Transform to recent orders format
          recentOrdersList = bookings.slice(0, 10).map((booking: any) => ({
            id: booking.id.toString(),
            customerName: booking.customer_name || 'ไม่ระบุชื่อ',
            phoneNumber: booking.phone_number || 'ไม่ระบุ',
            areaSize: booking.area_size || 0,
            cropType: booking.crop_type || 'ไม่ระบุ',
            sprayType: booking.spray_type || 'ไม่ระบุ', 
            totalPrice: booking.total_price || 0,
            depositAmount: booking.deposit_amount || 0,
            status: booking.status || 'pending_payment',
            scheduledDate: booking.scheduled_date || '',
            scheduledTime: booking.scheduled_time || '',
            createdAt: booking.created_at || '',
          }))
        }
      }

      let availableDrones = 0
      if (dronesResponse.ok) {
        const dronesData = await dronesResponse.json()
        if (dronesData.success && dronesData.data) {
          availableDrones = dronesData.data.filter((drone: any) => 
            drone.status === 'available'
          ).length
        }
      }

      setStats({
        totalOrders,
        totalRevenue,
        totalArea,
        activeOrders,
        availableDrones,
        completedToday,
        totalCustomers: Math.floor(totalOrders * 0.8), // Estimate unique customers
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      })

      setRecentOrders(recentOrdersList)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Fallback to empty data
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        totalArea: 0,
        activeOrders: 0,
        availableDrones: 0,
        completedToday: 0,
        totalCustomers: 0,
        averageOrderValue: 0,
      })
      setRecentOrders([])
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_payment: { label: "รอชำระ", variant: "destructive" as const },
      paid: { label: "ชำระแล้ว", variant: "default" as const },
      assigned: { label: "จัดโดรน", variant: "secondary" as const },
      completed: { label: "เสร็จสิ้น", variant: "default" as const },
      cancelled: { label: "ยกเลิก", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // แสดง loading state ขณะตรวจสอบ authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  // ถ้าไม่ได้ login ให้แสดงหน้าเปล่าขณะ redirect
  if (!user) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              ยินดีต้อนรับสู่ระบบจัดการบริการพ่นยาโดรน
            </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <BarChart3 className="h-4 w-4 mr-2" />
            รายงาน
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <ModernDashboardStats stats={stats} />

      {/* Quick Actions */}
      <ModernQuickActions />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-1">
          <ModernRecentOrders orders={recentOrders} />
        </div>

        {/* Today's Schedule */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    ตารางงานวันนี้
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    {currentDate || "กำลังโหลด..."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">ไม่มีงานที่กำหนดไว้</p>
                <p className="text-sm text-gray-400">งานที่กำหนดไว้จะปรากฏที่นี่</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
