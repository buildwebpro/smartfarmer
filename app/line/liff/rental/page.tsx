"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Truck, Calendar as CalendarIcon, CreditCard } from "lucide-react"
import { th } from "date-fns/locale"
import { format, differenceInDays } from "date-fns"
import Image from "next/image"
import { toast } from "sonner"

interface Equipment {
  id: string
  name: string
  model: string
  brand?: string
  description?: string
  rental_price_per_day: number
  rental_price_per_hour?: number
  deposit_amount: number
  image_url?: string
  category?: {
    name: string
    icon: string
  }
}

interface Category {
  id: string
  name: string
  icon: string
}

export default function EquipmentRentalPage() {
  const [step, setStep] = useState(1) // 1: Select Equipment, 2: Fill Details, 3: Confirm
  const [categories, setCategories] = useState<Category[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [lineUserId, setLineUserId] = useState<string>("guest-user")

  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    notes: "",
  })

  const [totalPrice, setTotalPrice] = useState(0)
  const [depositAmount, setDepositAmount] = useState(0)
  const [showQR, setShowQR] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchEquipment()

    // Get or create user ID
    const getOrCreateUserId = () => {
      let userId = localStorage.getItem('guest_user_id')
      if (!userId) {
        userId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('guest_user_id', userId)
      }
      return userId
    }
    setLineUserId(getOrCreateUserId())
  }, [])

  useEffect(() => {
    calculatePrice()
  }, [selectedEquipment, formData.startDate, formData.endDate])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/equipment/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchEquipment = async (categoryId?: string) => {
    try {
      const url = categoryId
        ? `/api/equipment?category=${categoryId}&status=available`
        : '/api/equipment?status=available'
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setEquipment(result.data)
      }
    } catch (error) {
      console.error('Error fetching equipment:', error)
    }
  }

  const calculatePrice = () => {
    if (!selectedEquipment || !formData.startDate || !formData.endDate) {
      setTotalPrice(0)
      setDepositAmount(0)
      return
    }

    const days = differenceInDays(formData.endDate, formData.startDate) + 1
    const total = days * selectedEquipment.rental_price_per_day
    setTotalPrice(total)
    setDepositAmount(selectedEquipment.deposit_amount)
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    fetchEquipment(categoryId)
  }

  const handleEquipmentSelect = (equip: Equipment) => {
    setSelectedEquipment(equip)
    setStep(2)
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.customerName || !formData.phoneNumber) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('กรุณาเลือกวันที่เช่า')
      return
    }

    setIsSubmitting(true)

    try {
      const days = differenceInDays(formData.endDate, formData.startDate) + 1

      const bookingData = {
        booking_type: 'rental',
        equipment_id: selectedEquipment?.id,
        customer_name: formData.customerName,
        customer_phone: formData.phoneNumber,
        rental_start_date: format(formData.startDate, 'yyyy-MM-dd'),
        rental_end_date: format(formData.endDate, 'yyyy-MM-dd'),
        rental_duration_days: days,
        total_price: totalPrice,
        deposit_amount: depositAmount,
        notes: formData.notes,
        line_user_id: lineUserId,
        status: 'pending_payment',
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        toast.success('จองเครื่องจักรสำเร็จ!')
        setShowQR(true)
      } else {
        toast.error('เกิดข้อผิดพลาดในการจอง')
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      toast.error('เกิดข้อผิดพลาดในการจอง')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    return differenceInDays(formData.endDate, formData.startDate) + 1
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/drone-service-login-logo.webp"
              alt="โลโก้"
              width={150}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold">เช่าเครื่องจักรการเกษตร</h1>
          <p className="text-gray-600 mt-2">เลือกเครื่องจักรและกำหนดระยะเวลาการเช่า</p>
        </div>

        {showQR ? (
          /* QR Code Payment */
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-6">
              <Image
                src="/images/drone-service-login-logo.webp"
                alt="โลโก้"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-700">ชำระเงินมัดจำ</h2>
            <Image
              src="/images/Drone Booking Service.png"
              alt="PromptPay QR"
              width={320}
              height={320}
              className="rounded-lg border"
            />
            <div className="mt-4 text-xl font-semibold text-green-700">
              ยอดมัดจำที่ต้องชำระ: {depositAmount.toLocaleString()} บาท
            </div>
            <p className="mt-2 text-gray-600 text-center px-4">
              กรุณาชำระเงินมัดจำและแจ้งสลิปผ่านทาง LINE
            </p>
            <Button
              className="mt-6"
              onClick={() => window.location.href = '/line/liff/my-bookings'}
            >
              ดูรายการจองของฉัน
            </Button>
          </div>
        ) : step === 1 ? (
          /* Step 1: Select Equipment */
          <div className="space-y-6">
            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle>เลือกประเภทเครื่องจักร</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="ทุกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ทุกประเภท</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Equipment List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipment.map(item => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleEquipmentSelect(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-10 h-10 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.model}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.category?.name}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-green-600 font-semibold">
                            ฿{item.rental_price_per_day.toLocaleString()}/วัน
                          </p>
                          <p className="text-sm text-gray-500">
                            มัดจำ: ฿{item.deposit_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : step === 2 ? (
          /* Step 2: Fill Details */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลการจอง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Equipment */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold">{selectedEquipment?.name}</p>
                      <p className="text-sm text-gray-600">{selectedEquipment?.model}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ชื่อ-นามสกุล *</Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>

                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์ *</Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="0xx-xxx-xxxx"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>วันเริ่มเช่า *</Label>
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      locale={th}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>วันสิ้นสุด *</Label>
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      locale={th}
                      disabled={(date) => !formData.startDate || date < formData.startDate}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>หมายเหตุ</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ข้อมูลเพิ่มเติม (ถ้ามี)"
                  />
                </div>

                {/* Price Summary */}
                {formData.startDate && formData.endDate && (
                  <div className="p-4 bg-green-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>ระยะเวลา:</span>
                      <span className="font-semibold">{getDays()} วัน</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ค่าเช่า/วัน:</span>
                      <span>฿{selectedEquipment?.rental_price_per_day.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>ค่าเช่ารวม:</span>
                      <span className="text-green-600">฿{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>เงินมัดจำ:</span>
                      <span className="font-semibold text-orange-600">฿{depositAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    ย้อนกลับ
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'กำลังจอง...' : 'ยืนยันการจอง'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
