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
import { 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  Bell,
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
      // Mock data for demonstration
      setStats({
        totalOrders: 156,
        totalRevenue: 234500,
        totalArea: 1250,
        activeOrders: 12,
        availableDrones: 4,
        completedToday: 8,
        totalCustomers: 89,
        averageOrderValue: 1503,
      })

      setRecentOrders([
        {
          id: "1",
          customerName: "นายสมชาย ใจดี",
          phoneNumber: "081-234-5678",
          areaSize: 5,
          cropType: "ข้าว",
          sprayType: "ปุ๋ย",
          totalPrice: 750,
          depositAmount: 225,
          status: "paid",
          scheduledDate: "2024-01-20",
          scheduledTime: "08:00",
          createdAt: "2024-01-18T10:30:00Z",
        },
        {
          id: "2",
          customerName: "นางสาวมาลี สวยงาม",
          phoneNumber: "082-345-6789",
          areaSize: 3,
          cropType: "ทุเรียน",
          sprayType: "ฮอร์โมน",
          totalPrice: 750,
          depositAmount: 225,
          status: "pending_payment",
          scheduledDate: "2024-01-21",
          scheduledTime: "09:00",
          createdAt: "2024-01-18T14:15:00Z",
        },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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
            <Bell className="h-4 w-4 mr-2" />
            แจ้งเตือน
          </Button>
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

        {/* Today's Schedule & Alerts */}
        <div className="lg:col-span-1 space-y-4">
          {/* Today's Schedule */}
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
                    {new Date().toLocaleDateString("th-TH", { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
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

          {/* Alerts */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    การแจ้งเตือน
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    ข้อความสำคัญและการแจ้งเตือน
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                  <div className="p-1 bg-yellow-100 rounded-full">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">โดรน #3 ต้องการการบำรุงรักษา</p>
                    <p className="text-sm text-yellow-600 mt-1">ครบกำหนดบำรุงรักษาในอีก 2 วัน</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">มีออร์เดอร์ใหม่ 3 รายการรอการยืนยัน</p>
                    <p className="text-sm text-blue-600 mt-1">กรุณาตรวจสอบและยืนยันออร์เดอร์</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                  <div className="p-1 bg-emerald-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-emerald-800">ยอดขายเดือนนี้เพิ่มขึ้น 15%</p>
                    <p className="text-sm text-emerald-600 mt-1">เมื่อเทียบกับเดือนที่แล้ว</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
