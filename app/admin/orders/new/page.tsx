"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Save, Plus } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface Drone {
  id: string
  name: string
  model: string
  status: string
}

interface Pilot {
  id: string
  name: string
  phone: string
  license_number: string
}

interface CropType {
  id: string
  name: string
  price_per_rai: number
}

function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [drones, setDrones] = useState<Drone[]>([])
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [cropTypes, setCropTypes] = useState<CropType[]>([])
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_line_id: '',
    farm_location: '',
    farm_size: '',
    crop_type_id: '',
    drone_id: '',
    pilot_id: '',
    scheduled_date: '',
    notes: '',
    total_price: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch drones
      const { data: dronesData } = await supabase
        .from('drones')
        .select('*')
        .eq('status', 'available')
      
      // Fetch pilots
      const { data: pilotsData } = await supabase
        .from('pilots')
        .select('*')
        .eq('status', 'active')
      
      // Fetch crop types
      const { data: cropTypesData } = await supabase
        .from('crop_types')
        .select('*')
      
      setDrones(dronesData || [])
      setPilots(pilotsData || [])
      setCropTypes(cropTypesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Calculate total price when farm_size or crop_type changes
      if (field === 'farm_size' || field === 'crop_type_id') {
        const farmSize = field === 'farm_size' ? Number(value) : Number(updated.farm_size)
        const cropTypeId = field === 'crop_type_id' ? value : updated.crop_type_id
        
        if (farmSize && cropTypeId) {
          const cropType = cropTypes.find(ct => ct.id === cropTypeId)
          if (cropType) {
            updated.total_price = farmSize * cropType.price_per_rai
          }
        }
      }
      
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          ...formData,
          farm_size: Number(formData.farm_size),
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('สร้างออร์เดอร์สำเร็จ!')
      router.push('/admin/orders')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('เกิดข้อผิดพลาดในการสร้างออร์เดอร์')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">เพิ่มออร์เดอร์ใหม่</h1>
            <p className="text-gray-500">สร้างรายการจองโดรนใหม่</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              ข้อมูลการจอง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">ชื่อลูกค้า *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">เบอร์โทรศัพท์ *</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_line_id">LINE ID</Label>
                <Input
                  id="customer_line_id"
                  value={formData.customer_line_id}
                  onChange={(e) => handleInputChange('customer_line_id', e.target.value)}
                />
              </div>

              {/* Farm Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm_location">ที่ตั้งแปลง *</Label>
                  <Input
                    id="farm_location"
                    value={formData.farm_location}
                    onChange={(e) => handleInputChange('farm_location', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farm_size">ขนาดแปลง (ไร่) *</Label>
                  <Input
                    id="farm_size"
                    type="number"
                    step="0.1"
                    value={formData.farm_size}
                    onChange={(e) => handleInputChange('farm_size', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crop_type_id">ชนิดพืช *</Label>
                  <Select
                    value={formData.crop_type_id}
                    onValueChange={(value) => handleInputChange('crop_type_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกชนิดพืช" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((cropType) => (
                        <SelectItem key={cropType.id} value={cropType.id}>
                          {cropType.name} ({cropType.price_per_rai} บาท/ไร่)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drone_id">โดรน *</Label>
                  <Select
                    value={formData.drone_id}
                    onValueChange={(value) => handleInputChange('drone_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกโดรน" />
                    </SelectTrigger>
                    <SelectContent>
                      {drones.map((drone) => (
                        <SelectItem key={drone.id} value={drone.id}>
                          {drone.name} ({drone.model})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pilot_id">นักบิน *</Label>
                  <Select
                    value={formData.pilot_id}
                    onValueChange={(value) => handleInputChange('pilot_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกนักบิน" />
                    </SelectTrigger>
                    <SelectContent>
                      {pilots.map((pilot) => (
                        <SelectItem key={pilot.id} value={pilot.id}>
                          {pilot.name} ({pilot.license_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">วันที่นัดหมาย *</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_price">ราคารวม (บาท)</Label>
                  <Input
                    id="total_price"
                    type="number"
                    value={formData.total_price}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'กำลังบันทึก...' : 'บันทึกออร์เดอร์'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

export default NewOrderPage