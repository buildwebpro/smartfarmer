"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  TrendingUp,
  MapPin,
  Bell,
  Plus,
  Tractor,
  MessageSquare,
  Star,
  Sun,
  CloudRain,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

interface FarmerDashboardStats {
  jobsPosted: number
  activeJobs: number
  completedJobs: number
  activeBookings: number
  totalFarmSize: number
}

interface CalendarActivity {
  id: string
  activity_type: string
  crop: string
  date: string
  notes: string
  is_completed: boolean
}

interface Notification {
  id: string
  type: string
  message: string
  created_at: string
  read: boolean
}

export default function FarmerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<FarmerDashboardStats>({
    jobsPosted: 0,
    activeJobs: 0,
    completedJobs: 0,
    activeBookings: 0,
    totalFarmSize: 20
  })
  const [todayActivities, setTodayActivities] = useState<CalendarActivity[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [weather, setWeather] = useState({
    condition: "แดดดี",
    temp: "28-32°C",
    rainChance: "10%"
  })

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const userData = localStorage.getItem('user')
    if (!userData) return

    const user = JSON.parse(userData)

    try {
      // Fetch real stats from job_postings
      const jobsResponse = await fetch(`/api/jobs?farmer_id=${user.id}`)
      if (jobsResponse.ok) {
        const { data: jobs } = await jobsResponse.json()
        const activeJobs = jobs?.filter((j: any) => j.status === 'open').length || 0
        const completedJobs = jobs?.filter((j: any) => j.status === 'completed').length || 0

        setStats({
          jobsPosted: jobs?.length || 0,
          activeJobs,
          completedJobs,
          activeBookings: 0, // TODO: Fetch from bookings API
          totalFarmSize: 20
        })
      }

      // Fetch today's activities (if farm_calendar table exists)
      // For now, show empty or mock data
      setTodayActivities([])

      // TODO: Fetch real notifications
      setNotifications([])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('user_role')
    document.cookie = 'user=; path=/; max-age=0'
    document.cookie = 'user_role=; path=/; max-age=0'
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {user?.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">สวัสดี {user?.name || 'คุณเกษตรกร'}</h1>
                <p className="text-green-100 flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  ฟาร์มข้าว {stats.totalFarmSize} ไร่
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-green-700 hover:bg-green-50"
              >
                <Bell className="h-4 w-4 mr-2" />
                {notifications.filter(n => !n.read).length} แจ้งเตือน
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.jobsPosted}</div>
              <div className="text-sm text-gray-600">งานที่โพสต์</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.activeBookings}</div>
              <div className="text-sm text-gray-600">การจอง</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.activeJobs}</div>
              <div className="text-sm text-gray-600">กำลังดำเนินการ</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.completedJobs}</div>
              <div className="text-sm text-gray-600">เสร็จสิ้น</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Calendar & Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <CardTitle>ปฏิทินวันนี้</CardTitle>
              </div>
              <CardDescription>
                {new Date().toLocaleDateString('th-TH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayActivities.length > 0 ? (
                <div className="space-y-3">
                  {todayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="border-l-4 border-l-orange-500 bg-orange-50 p-4 rounded"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-900">
                              {activity.activity_type} - {activity.crop}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.notes}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ⏰ แนะนำ: 16-18 ม.ค.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          จ้างผู้เชี่ยวชาญ
                        </Button>
                        <Button size="sm" variant="outline">
                          เลื่อนกำหนด
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>ไม่มีกิจกรรมวันนี้</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weather */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <CardTitle>พยากรณ์อากาศ</CardTitle>
              </div>
              <CardDescription>นครราชสีมา</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Sun className="h-16 w-16 text-yellow-500" />
                  <div>
                    <div className="text-3xl font-bold">{weather.temp}</div>
                    <div className="text-gray-600">{weather.condition}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CloudRain className="h-4 w-4" />
                      โอกาสฝนตก
                    </div>
                    <div className="font-semibold">{weather.rainChance}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">คำแนะนำ</div>
                    <div className="font-semibold text-green-600">เหมาะพ่นยา</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>แจ้งเตือน</CardTitle>
                <Badge variant="secondary">{notifications.filter(n => !n.read).length}</Badge>
              </div>
              <Button variant="ghost" size="sm">
                ดูทั้งหมด
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded border ${
                    notif.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.created_at).toLocaleString('th-TH')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/farmer/post-job">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6 text-center">
                <Plus className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <div className="font-semibold text-green-900">โพสต์งาน</div>
                <div className="text-xs text-green-700">หาผู้รับจ้าง</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/farmer/equipment">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6 text-center">
                <Tractor className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                <div className="font-semibold text-blue-900">เช่าเครื่องจักร</div>
                <div className="text-xs text-blue-700">โดรน, รถไถ, รถเกี่ยว</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/farmer/calendar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-purple-600" />
                <div className="font-semibold text-purple-900">ปฏิทิน</div>
                <div className="text-xs text-purple-700">กิจกรรมการเกษตร</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/farmer/my-jobs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-orange-600" />
                <div className="font-semibold text-orange-900">งานของฉัน</div>
                <div className="text-xs text-orange-700">ดูสถานะงาน</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/farmer/messages">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-pink-600" />
                <div className="font-semibold text-pink-900">ข้อความ</div>
                <div className="text-xs text-pink-700">แชทกับผู้รับจ้าง</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/farmer/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="pt-6 text-center">
                <Star className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                <div className="font-semibold text-gray-900">โปรไฟล์</div>
                <div className="text-xs text-gray-700">จัดการข้อมูล</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
