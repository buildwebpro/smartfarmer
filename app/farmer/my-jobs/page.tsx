"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, Clock, DollarSign, MessageSquare, Eye } from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  title: string
  job_type: string
  area_size: number
  province: string
  budget_min: number
  budget_max: number
  status: string
  proposal_count: number
  created_at: string
  preferred_date?: string
}

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('open')

  useEffect(() => {
    fetchMyJobs()
  }, [activeTab])

  const fetchMyJobs = async () => {
    setLoading(true)
    try {
      // TODO: Get farmer_id from auth
      const response = await fetch(`/api/jobs?status=${activeTab}`)
      const result = await response.json()

      if (result.success) {
        setJobs(result.data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      open: { label: 'เปิดรับข้อเสนอ', variant: 'default' as const, color: 'bg-green-500' },
      in_progress: { label: 'กำลังดำเนินการ', variant: 'secondary' as const, color: 'bg-blue-500' },
      completed: { label: 'เสร็จสิ้น', variant: 'outline' as const, color: 'bg-gray-500' },
      cancelled: { label: 'ยกเลิก', variant: 'destructive' as const, color: 'bg-red-500' }
    }
    const config = configs[status as keyof typeof configs] || configs.open
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/farmer/dashboard">
            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">งานของฉัน</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="open">เปิดรับ</TabsTrigger>
            <TabsTrigger value="in_progress">กำลังทำ</TabsTrigger>
            <TabsTrigger value="completed">เสร็จสิ้น</TabsTrigger>
            <TabsTrigger value="cancelled">ยกเลิก</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">กำลังโหลด...</p>
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">ไม่มีงานในหมวดนี้</p>
                  <Link href="/farmer/post-job">
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">
                      โพสต์งานใหม่
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="text-3xl">
                              {job.job_type === 'พ่นยา' && '🚁'}
                              {job.job_type === 'ไถนา' && '🚜'}
                              {job.job_type === 'เกี่ยวข้าว' && '🌾'}
                              {job.job_type === 'ระบบน้ำ' && '💧'}
                              {job.job_type === 'อื่นๆ' && '🔧'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.province}
                                </span>
                                <span>📐 {job.area_size} ไร่</span>
                                {job.preferred_date && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(job.preferred_date).toLocaleDateString('th-TH')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-700">
                                {job.budget_min.toLocaleString()} - {job.budget_max.toLocaleString()} บาท
                              </span>
                            </div>
                            {getStatusBadge(job.status)}
                          </div>
                        </div>
                      </div>

                      {job.status === 'open' && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-900">
                              <MessageSquare className="h-5 w-5" />
                              <span className="font-semibold">
                                มีข้อเสนอ {job.proposal_count} รายการ
                              </span>
                            </div>
                            <Link href={`/farmer/jobs/${job.id}/proposals`}>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                ดูข้อเสนอ
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link href={`/farmer/jobs/${job.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            ดูรายละเอียด
                          </Button>
                        </Link>
                        {job.status === 'open' && (
                          <>
                            <Button variant="outline" size="sm">แก้ไข</Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              ยกเลิก
                            </Button>
                          </>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        โพสต์เมื่อ: {new Date(job.created_at).toLocaleString('th-TH')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
