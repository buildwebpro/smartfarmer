"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, TrendingUp, Clock, CheckCircle, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"

interface ProviderStats {
  totalJobsCompleted: number
  monthlyRevenue: number
  pendingJobs: number
  avgRating: number
  totalReviews: number
}

interface NearbyJob {
  id: string
  title: string
  job_type: string
  area_size: number
  distance: number
  province: string
  budget_min: number
  budget_max: number
  preferred_date?: string
}

export default function ProviderDashboard() {
  const [stats, setStats] = useState<ProviderStats>({
    totalJobsCompleted: 45,
    monthlyRevenue: 18500,
    pendingJobs: 2,
    avgRating: 4.8,
    totalReviews: 23
  })
  const [nearbyJobs, setNearbyJobs] = useState<NearbyJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // TODO: Fetch real data
      setNearbyJobs([
        {
          id: "1",
          title: "พ่นยานาข้าวโพด",
          job_type: "พ่นยา",
          area_size: 10,
          distance: 5,
          province: "นครราชสีมา",
          budget_min: 1500,
          budget_max: 2000,
          preferred_date: "2025-01-18"
        },
        {
          id: "2",
          title: "ไถนาเตรียมปลูกข้าว",
          job_type: "ไถนา",
          area_size: 8,
          distance: 12,
          province: "นครราชสีมา",
          budget_min: 800,
          budget_max: 1000
        }
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarFallback className="bg-blue-800 text-white text-xl">
                สศ
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">นายสมศักดิ์ บินเก่ง</h1>
              <p className="text-blue-100">โดรนพ่นยา • นครราชสีมา</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{stats.avgRating}</span>
                  <span className="text-sm">({stats.totalReviews} รีวิว)</span>
                </div>
                <Badge className="bg-green-500">✅ Verified</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalJobsCompleted}
                  </div>
                  <div className="text-sm text-gray-600">งานที่เสร็จ</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    ฿{stats.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">รายได้เดือนนี้</div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.pendingJobs}
                  </div>
                  <div className="text-sm text-gray-600">รอดำเนินการ</div>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-purple-600">
                      {stats.avgRating}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">คะแนนเฉลี่ย</div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nearby Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">งานใหม่ใกล้ๆ คุณ</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {nearbyJobs.length} งานที่เหมาะสมกับคุณ
                </p>
              </div>
              <Link href="/provider/browse-jobs">
                <Button variant="outline">ดูทั้งหมด</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">กำลังโหลด...</p>
              </div>
            ) : nearbyJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ไม่มีงานใหม่ในขณะนี้
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <div className="text-3xl">
                          {job.job_type === 'พ่นยา' && '🚁'}
                          {job.job_type === 'ไถนา' && '🚜'}
                          {job.job_type === 'เกี่ยวข้าว' && '🌾'}
                        </div>
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-700">
                                {job.distance} กม.
                              </span>
                              จากคุณ
                            </span>
                            <span>• {job.province}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{job.job_type}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">พื้นที่:</span>
                        <span className="font-medium ml-1">{job.area_size} ไร่</span>
                      </div>
                      <div>
                        <span className="text-gray-600">งบ:</span>
                        <span className="font-medium ml-1 text-green-700">
                          {job.budget_min.toLocaleString()}-{job.budget_max.toLocaleString()} บาท
                        </span>
                      </div>
                      {job.preferred_date && (
                        <div>
                          <span className="text-gray-600">วันที่:</span>
                          <span className="font-medium ml-1">
                            {new Date(job.preferred_date).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/provider/jobs/${job.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          ดูรายละเอียด
                        </Button>
                      </Link>
                      <Link href={`/provider/jobs/${job.id}/send-proposal`} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          ส่งข้อเสนอ
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/provider/browse-jobs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-2">🔍</div>
                <div className="font-semibold text-blue-900">หางาน</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/provider/my-proposals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-2">💼</div>
                <div className="font-semibold text-green-900">ข้อเสนอของฉัน</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/provider/earnings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-2">💰</div>
                <div className="font-semibold text-purple-900">รายได้</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/provider/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-2">👤</div>
                <div className="font-semibold text-orange-900">โปรไฟล์</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
