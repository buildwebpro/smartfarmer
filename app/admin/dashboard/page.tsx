"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Calendar,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  LogOut,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalArea: number
  activeOrders: number
  availableDrones: number
  completedToday: number
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
  const { user, logout } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalArea: 0,
    activeOrders: 0,
    availableDrones: 6,
    completedToday: 0,
  })

  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/admin/login")
      return
    }
    fetchDashboardData()
  }, [user, router])

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

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  if (!user) {
    return <div>กำลังโหลด...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">ระบบจัดการโดรน</h1>
                <p className="text-sm text-gray-600">ยินดีต้อนรับ, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{user.role}</Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                ตั้งค่า
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">ภาพรวมระบบบริการพ่นยาโดรน</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/orders">
              <Button variant="outline">จัดการออร์เดอร์</Button>
            </Link>
            {user.role === "admin" && (
              <Link href="/admin/drones">
                <Button variant="outline">จัดการโดรน</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ออร์เดอร์ทั้งหมด</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">+12% จากเดือนที่แล้ว</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% จากเดือนที่แล้ว</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">พื้นที่รวม</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArea}</div>
              <p className="text-xs text-muted-foreground">ไร่ที่พ่นไปแล้ว</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ออร์เดอร์ที่รอ</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">รอดำเนินการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">โดรนพร้อมใช้</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableDrones}/6</div>
              <p className="text-xs text-muted-foreground">ลำที่พร้อมใช้งาน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เสร็จวันนี้</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">งานที่เสร็จสิ้น</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">ออร์เดอร์ล่าสุด</TabsTrigger>
            <TabsTrigger value="schedule">ตารางงานวันนี้</TabsTrigger>
            <TabsTrigger value="alerts">การแจ้งเตือน</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ออร์เดอร์ล่าสุด</CardTitle>
                <CardDescription>รายการออร์เดอร์ที่เข้ามาใหม่จาก LINE</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm">
                              {order.cropType} - {order.sprayType}
                            </p>
                            <p className="text-sm text-gray-600">{order.areaSize} ไร่</p>
                          </div>
                          <div>
                            <p className="text-sm">วันที่: {new Date(order.scheduledDate).toLocaleDateString("th-TH")}</p>
                            <p className="text-sm text-gray-600">เวลา: {order.scheduledTime} น.</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">฿{order.totalPrice.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">มัดจำ: ฿{order.depositAmount.toLocaleString()}</p>
                        </div>
                        {getStatusBadge(order.status)}
                        <Button size="sm" variant="outline">
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ตารางงานวันนี้</CardTitle>
                <CardDescription>รายการงานที่กำหนดไว้สำหรับวันนี้</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>ไม่มีงานที่กำหนดไว้สำหรับวันนี้</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>การแจ้งเตือน</CardTitle>
                <CardDescription>การแจ้งเตือนและข้อความสำคัญ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">โดรน #3 ต้องการการบำรุงรักษา</p>
                      <p className="text-sm text-yellow-600">ครบกำหนดบำรุงรักษาในอีก 2 วัน</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">มีออร์เดอร์ใหม่ 3 รายการจาก LINE รอการยืนยัน</p>
                      <p className="text-sm text-blue-600">กรุณาตรวจสอบและยืนยันออร์เดอร์</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
