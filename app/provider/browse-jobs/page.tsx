"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Search, MapPin, DollarSign, Calendar, Filter } from "lucide-react"
import Link from "next/link"

const JOB_TYPES = [
  { value: "all", label: "ทั้งหมด" },
  { value: "พ่นยา", label: "พ่นยาโดรน" },
  { value: "ไถนา", label: "ไถนา" },
  { value: "เกี่ยวข้าว", label: "เกี่ยวข้าว" },
  { value: "ระบบน้ำ", label: "ระบบน้ำ" },
  { value: "อื่นๆ", label: "อื่นๆ" },
]

interface Job {
  id: string
  title: string
  job_type: string
  area_size: number
  distance?: number
  province: string
  district: string
  budget_min: number
  budget_max: number
  preferred_date?: string
  description: string
  farmer: {
    name: string
    avg_rating?: number
  }
}

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    job_type: "all",
    province: "",
    max_distance: "50",
    min_budget: "",
    max_budget: "",
    search: ""
  })

  useEffect(() => {
    fetchJobs()
  }, [filters])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.job_type !== "all") params.append('job_type', filters.job_type)
      if (filters.province) params.append('province', filters.province)

      const response = await fetch(`/api/jobs?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        // Mock distance calculation
        const jobsWithDistance = result.data.map((job: Job) => ({
          ...job,
          distance: Math.floor(Math.random() * 50) + 1
        }))
        setJobs(jobsWithDistance)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.max_distance && job.distance && job.distance > parseInt(filters.max_distance)) {
      return false
    }
    if (filters.min_budget && job.budget_max < parseInt(filters.min_budget)) {
      return false
    }
    if (filters.max_budget && job.budget_min > parseInt(filters.max_budget)) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/provider/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">หางาน</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหางาน..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Filters */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">ฟิลเตอร์</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">ประเภทงาน</label>
                <Select
                  value={filters.job_type}
                  onValueChange={(value) => setFilters({ ...filters, job_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">ระยะทาง (กม.)</label>
                <Select
                  value={filters.max_distance}
                  onValueChange={(value) => setFilters({ ...filters, max_distance: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">&lt; 10 กม.</SelectItem>
                    <SelectItem value="20">&lt; 20 กม.</SelectItem>
                    <SelectItem value="50">&lt; 50 กม.</SelectItem>
                    <SelectItem value="100">&lt; 100 กม.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">งบต่ำสุด</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.min_budget}
                  onChange={(e) => setFilters({ ...filters, min_budget: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">งบสูงสุด</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={filters.max_budget}
                  onChange={(e) => setFilters({ ...filters, max_budget: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                พบ {filteredJobs.length} งาน
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  job_type: "all",
                  province: "",
                  max_distance: "50",
                  min_budget: "",
                  max_budget: "",
                  search: ""
                })}
              >
                ล้างฟิลเตอร์
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">กำลังโหลด...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">ไม่พบงานที่ตรงกับเกณฑ์</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 flex-1">
                      <div className="text-3xl">
                        {job.job_type === 'พ่นยา' && '🚁'}
                        {job.job_type === 'ไถนา' && '🚜'}
                        {job.job_type === 'เกี่ยวข้าว' && '🌾'}
                        {job.job_type === 'ระบบน้ำ' && '💧'}
                        {job.job_type === 'อื่นๆ' && '🔧'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>โดย: {job.farmer.name}</span>
                          {job.farmer.avg_rating && (
                            <span className="flex items-center gap-1">
                              • ⭐ {job.farmer.avg_rating}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-700">
                              {job.distance} กม.
                            </span>
                            • {job.province}
                          </span>
                          <span>📐 {job.area_size} ไร่</span>
                          {job.preferred_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(job.preferred_date).toLocaleDateString('th-TH')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge>{job.job_type}</Badge>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900">
                        {job.budget_min.toLocaleString()} - {job.budget_max.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {job.description}
                    </p>
                  )}

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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
