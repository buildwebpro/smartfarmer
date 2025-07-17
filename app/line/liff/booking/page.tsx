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
import Image from "next/image"

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
    selectedDate: undefined as Date | undefined,
    notes: "",
  })
  const [lineUserId, setLineUserId] = useState<string>("")

  const [cropTypes, setCropTypes] = useState<CropType[]>([])
  const [sprayTypes, setSprayTypes] = useState<SprayType[]>([])

  const [totalPrice, setTotalPrice] = useState(0)
  const [depositAmount, setDepositAmount] = useState(0)
  const [showQR, setShowQR] = useState(false)
  const [lastDeposit, setLastDeposit] = useState(0)

  useEffect(() => {
    calculatePrice()
    // ดึงข้อมูลชนิดพืชและสารพ่นจาก Supabase
    const fetchTypes = async () => {
      const { data: crops } = await fetch("/api/crop-types").then(res => res.json())
      setCropTypes(crops || [])
      const { data: sprays } = await fetch("/api/spray-types").then(res => res.json())
      setSprayTypes(sprays || [])
    }
    fetchTypes()
    // ดึง LINE USER ID จาก LIFF SDK
    const getLineUserId = async () => {
      if (typeof window !== "undefined" && (window as any).liff) {
        const liff = (window as any).liff
        if (!liff.isLoggedIn()) {
          liff.login()
        } else {
          const profile = await liff.getProfile()
          setLineUserId(profile.userId)
        }
      }
    }
    getLineUserId()
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
      lineUserId, // ส่ง userId ไปกับข้อมูล order
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
        setLastDeposit(depositAmount)
        setShowQR(true)
        // ไม่ alert, ไม่ redirect
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
        {showQR ? (
          <div className="flex flex-col items-center justify-center py-8">
            <h2 className="text-2xl font-bold mb-4 text-green-700">ชำระเงินมัดจำ</h2>
            <Image src="/qr-promptpay.jpg" alt="PromptPay QR" width={320} height={320} className="rounded-lg border" />
            <div className="mt-4 text-xl font-semibold text-green-700">ยอดมัดจำที่ต้องชำระ: {lastDeposit.toLocaleString()} บาท</div>
            <div className="mt-2 text-gray-600">กรุณาสแกน QR เพื่อชำระเงินมัดจำ<br/>หลังชำระเงินแล้วรอเจ้าหน้าที่ตรวจสอบสถานะ</div>
            <button className="mt-6 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowQR(false)}>กลับสู่หน้าจอง</button>
          </div>
        ) : (
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

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle>เลือกวัน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="w-full">
                    <Label>เลือกวันที่ *</Label>
                    <Calendar
                      mode="single"
                      selected={formData.selectedDate}
                      onSelect={(date) => setFormData({ ...formData, selectedDate: date })}
                      locale={th}
                      disabled={(date) => date && date < new Date()}
                      className="w-full rounded-md border"
                    />
                    {formData.selectedDate && (
                      <div className="mt-2 text-center text-green-700 font-semibold">
                        วันที่ที่เลือก: {formData.selectedDate.toLocaleDateString("th-TH")}
                      </div>
                    )}
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
        )}
      </div>
    </div>
  )
}