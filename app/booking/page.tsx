"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { MapPin, Calculator, CreditCard } from "lucide-react"
import { th } from "date-fns/locale"

interface CropType {
  id: string
  name: string
  pricePerRai: number
}

interface SprayType {
  id: string
  name: string
  pricePerRai: number
}

export default function BookingPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    areaSize: "",
    cropType: "",
    sprayType: "",
    gpsCoordinates: "",
    selectedDate: null as Date | null,
    selectedTime: "",
    notes: "",
  })

  const [cropTypes] = useState<CropType[]>([
    { id: "1", name: "ข้าว", pricePerRai: 50 },
    { id: "2", name: "อ้อย", pricePerRai: 70 },
    { id: "3", name: "ทุเรียน", pricePerRai: 100 },
    { id: "4", name: "มันสำปะหลัng", pricePerRai: 70 },
  ])

  const [sprayTypes] = useState<SprayType[]>([
    { id: "1", name: "ปุ๋ย", pricePerRai: 100 },
    { id: "2", name: "ฮอร์โมน", pricePerRai: 150 },
    { id: "3", name: "ยาฆ่าหญ้า", pricePerRai: 200 },
  ])

  const [totalPrice, setTotalPrice] = useState(0)
  const [depositAmount, setDepositAmount] = useState(0)

  const timeSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "17:00"]

  useEffect(() => {
    calculatePrice()
  }, [formData.areaSize, formData.cropType, formData.sprayType])

  const calculatePrice = () => {
    const areaSize = Number.parseFloat(formData.areaSize) || 0
    const selectedCrop = cropTypes.find((c) => c.id === formData.cropType)
    const selectedSpray = sprayTypes.find((s) => s.id === formData.sprayType)

    if (areaSize && selectedCrop && selectedSpray) {
      const total = areaSize * (selectedCrop.pricePerRai + selectedSpray.pricePerRai)
      setTotalPrice(total)
      setDepositAmount(total * 0.3)
    } else {
      setTotalPrice(0)
      setDepositAmount(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const bookingData = {
      ...formData,
      totalPrice,
      depositAmount,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        alert("การจองสำเร็จ! กรุณาชำระเงินมัดจำ")
        // Redirect to payment page
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">จองบริการพ่นยาโดรน</h1>
          <p className="text-gray-600">กรอกข้อมูลเพื่อจองบริการพ่นยาโดรน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลลูกค้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">ชื่อ-นามสกุล *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">เบอร์โทรศัพท์ *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดบริการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="areaSize">จำนวนไร่ *</Label>
                  <Input
                    id="areaSize"
                    type="number"
                    step="0.1"
                    value={formData.areaSize}
                    onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cropType">ชนิดพืช *</Label>
                  <Select
                    value={formData.cropType}
                    onValueChange={(value) => setFormData({ ...formData, cropType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกชนิดพืช" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((crop) => (
                        <SelectItem key={crop.id} value={crop.id}>
                          {crop.name} ({crop.pricePerRai} บาท/ไร่)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sprayType">ชนิดสารพ่น *</Label>
                  <Select
                    value={formData.sprayType}
                    onValueChange={(value) => setFormData({ ...formData, sprayType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสารพ่น" />
                    </SelectTrigger>
                    <SelectContent>
                      {sprayTypes.map((spray) => (
                        <SelectItem key={spray.id} value={spray.id}>
                          {spray.name} ({spray.pricePerRai} บาท/ไร่)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="gpsCoordinates">พิกัด GPS</Label>
                <div className="flex gap-2">
                  <Input
                    id="gpsCoordinates"
                    placeholder="ระบุพิกัด GPS หรือที่อยู่"
                    value={formData.gpsCoordinates}
                    onChange={(e) => setFormData({ ...formData, gpsCoordinates: e.target.value })}
                  />
                  <Button type="button" variant="outline">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle>เลือกวันและเวลา</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>เลือกวันที่ *</Label>
                  <Calendar
                    mode="single"
                    selected={formData.selectedDate}
                    onSelect={(date) => setFormData({ ...formData, selectedDate: date })}
                    locale={th}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <Label htmlFor="selectedTime">เลือกเวลา *</Label>
                  <Select
                    value={formData.selectedTime}
                    onValueChange={(value) => setFormData({ ...formData, selectedTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time} น.
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                สรุปราคา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>ราคารวมทั้งหมด:</span>
                  <span className="font-semibold">{totalPrice.toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>ยอดมัดจำ (30%):</span>
                  <span>{depositAmount.toLocaleString()} บาท</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>หมายเหตุเพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700">
              <CreditCard className="h-4 w-4 mr-2" />
              ยืนยันการจองและชำระเงิน
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
