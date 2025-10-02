"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Upload, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const JOB_TYPES = [
  { id: "พ่นยา", name: "พ่นยาโดรน", icon: "🚁" },
  { id: "ไถนา", name: "ไถนา", icon: "🚜" },
  { id: "เกี่ยวข้าว", name: "เกี่ยวข้าว", icon: "🌾" },
  { id: "ระบบน้ำ", name: "วางระบบน้ำ", icon: "💧" },
  { id: "อื่นๆ", name: "อื่นๆ", icon: "🔧" },
]

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    job_type: "",
    title: "",
    description: "",
    area_size: "",
    address: "",
    province: "นครราชสีมา",
    district: "",
    budget_min: "",
    budget_max: "",
    preferred_date: "",
    images: [] as string[]
  })

  const handleJobTypeSelect = (type: string) => {
    setFormData({ ...formData, job_type: type })

    // Auto-generate title if empty
    if (!formData.title) {
      const jobTypeName = JOB_TYPES.find(j => j.id === type)?.name || type
      setFormData(prev => ({
        ...prev,
        job_type: type,
        title: `${jobTypeName} ${prev.area_size ? prev.area_size + ' ไร่' : ''}`
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Get farmer_id from auth context
      const farmer_id = "temp-user-id" // Replace with actual user ID

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          farmer_id,
          area_size: parseFloat(formData.area_size),
          budget_min: parseFloat(formData.budget_min),
          budget_max: parseFloat(formData.budget_max)
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('โพสต์งานสำเร็จ!', {
          description: 'ผู้รับจ้างจะได้รับการแจ้งเตือนทันที'
        })
        router.push('/farmer/my-jobs')
      } else {
        toast.error('เกิดข้อผิดพลาด', {
          description: result.error
        })
      }
    } catch (error) {
      console.error('Error posting job:', error)
      toast.error('เกิดข้อผิดพลาด', {
        description: 'กรุณาลองใหม่อีกครั้ง'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // TODO: Upload to storage and get URLs
      toast.info('กำลังอัปโหลดรูปภาพ...')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/farmer/dashboard">
            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">โพสต์งาน</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>ประเภทงาน *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {JOB_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleJobTypeSelect(type.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      formData.job_type === type.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-3xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.name}</div>
                  </button>
                ))}
              </div>
              {formData.job_type && (
                <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                  ✓ เลือก: {JOB_TYPES.find(t => t.id === formData.job_type)?.name}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">หัวเรื่อง *</Label>
                <Input
                  id="title"
                  placeholder="เช่น พ่นยานาข้าวโพด"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="area_size">พื้นที่ (ไร่) *</Label>
                <Input
                  id="area_size"
                  type="number"
                  step="0.1"
                  placeholder="10"
                  value={formData.area_size}
                  onChange={(e) => setFormData({ ...formData, area_size: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
                <Textarea
                  id="description"
                  placeholder="ระบุรายละเอียดงาน เช่น ชนิดพืช อายุพืช สภาพแปลง ฯลฯ"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>ตำแหน่งแปลง *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">ที่อยู่/รายละเอียดที่ตั้ง</Label>
                <Textarea
                  id="address"
                  placeholder="เช่น บ้านเลขที่ ถนน ตำบล หรือจุดสังเกต"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">จังหวัด *</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="district">อำเภอ *</Label>
                  <Input
                    id="district"
                    placeholder="เช่น เมือง"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                เลือกตำแหน่งบนแผนที่
              </Button>
            </CardContent>
          </Card>

          {/* Budget & Date */}
          <Card>
            <CardHeader>
              <CardTitle>งบประมาณและกำหนดการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>งบประมาณ (บาท) *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="สูงสุด"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                    required
                  />
                </div>
                {formData.budget_min && formData.budget_max && (
                  <p className="text-sm text-gray-600 mt-2">
                    งบ: {parseFloat(formData.budget_min).toLocaleString()} - {parseFloat(formData.budget_max).toLocaleString()} บาท
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="preferred_date">วันที่ต้องการ</Label>
                <Input
                  id="preferred_date"
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>รูปภาพแปลง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            images: formData.images.filter((_, i) => i !== idx)
                          })
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {formData.images.length < 6 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">เพิ่มรูป</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  อัปโหลดได้สูงสุด 6 รูป
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="sticky bottom-0 bg-white border-t p-4 -mx-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'กำลังโพสต์...' : 'โพสต์งาน'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
