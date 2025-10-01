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
import { MapPin, Calculator, CreditCard, Navigation, FileText, Zap, Truck } from "lucide-react"
import { th } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"

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

interface Equipment {
  id: string
  name: string
  model: string
  rental_price_per_day: number
  deposit_amount: number
  category?: {
    name: string
  }
}

export default function BookingPage() {
  const [serviceType, setServiceType] = useState<'drone' | 'equipment'>('drone')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string>('')

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
  const [lineUserId, setLineUserId] = useState<string>("guest-user")
  const [gettingLocation, setGettingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [liffReady, setLiffReady] = useState(true) // เซ็ตเป็น true เลย
  const [liffError, setLiffError] = useState<string>("")

  const [cropTypes, setCropTypes] = useState<CropType[]>([
    { id: "rice", name: "ข้าว", pricePerRai: 300 },
    { id: "corn", name: "ข้าวโพด", pricePerRai: 350 },
    { id: "sugarcane", name: "อ้อย", pricePerRai: 400 },
    { id: "cassava", name: "มันสำปะหลัง", pricePerRai: 320 },
    { id: "rubber", name: "ยางพารา", pricePerRai: 380 }
  ])
  const [sprayTypes, setSprayTypes] = useState<SprayType[]>([
    { id: "herbicide", name: "ยาฆ่าหญ้า", pricePerRai: 100 },
    { id: "insecticide", name: "ยาฆ่าแมลง", pricePerRai: 150 },
    { id: "fertilizer", name: "ปุ่ยเหลว", pricePerRai: 200 },
    { id: "fungicide", name: "ยาฆ่าเชื้อรา", pricePerRai: 180 }
  ])
  const [loadingTypes, setLoadingTypes] = useState(false) // เปลี่ยนเป็น false เพื่อให้แสดงข้อมูลทันที

  const [totalPrice, setTotalPrice] = useState(0)
  const [depositAmount, setDepositAmount] = useState(0)
  const [showQR, setShowQR] = useState(false)
  const [lastDeposit, setLastDeposit] = useState(0)

  useEffect(() => {
    calculatePrice()
  }, [formData.areaSize, formData.cropType, formData.sprayType, selectedEquipment, serviceType])

  useEffect(() => {
    // ดึงข้อมูลชนิดพืชและสารพ่นจาก API
    const fetchTypes = async () => {
      setLoadingTypes(true) // เริ่มแสดงสถานะ loading
      try {
        // ดึงข้อมูลพร้อมกัน
        const [cropResponse, sprayResponse, equipmentResponse] = await Promise.all([
          fetch("/api/crop-types"),
          fetch("/api/spray-types"),
          fetch("/api/equipment?status=available")
        ])

        const [cropResult, sprayResult, equipmentResult] = await Promise.all([
          cropResponse.json(),
          sprayResponse.json(),
          equipmentResponse.json()
        ])

        // อัพเดทข้อมูลใหม่จาก API หากมี
        if (cropResult.data && cropResult.data.length > 0) {
          setCropTypes(cropResult.data)
        }

        if (sprayResult.data && sprayResult.data.length > 0) {
          setSprayTypes(sprayResult.data)
        }

        if (equipmentResult.success && equipmentResult.data) {
          setEquipment(equipmentResult.data)
        }
      } catch (error) {
        console.error("Error fetching types:", error)
        // คงข้อมูลเริ่มต้นไว้หาก API ล้มเหลว
      } finally {
        setLoadingTypes(false)
      }
    }
    fetchTypes()

    // ไม่ต้องเช็ค LIFF หรือ LINE login - แค่เซ็ตให้พร้อมใช้งาน
    console.log('📱 [LIFF] Simulated LIFF environment ready');
    setLiffReady(true);

    // สร้าง persistent user ID ใน localStorage
    const getOrCreateUserId = () => {
      let userId = localStorage.getItem('guest_user_id');
      if (!userId) {
        userId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guest_user_id', userId);
        console.log('📝 [USER] Created new guest user ID:', userId);
      } else {
        console.log('🔄 [USER] Retrieved existing guest user ID:', userId);
      }
      return userId;
    };

    const userId = getOrCreateUserId();
    setLineUserId(userId);
  }, [])

  const calculatePrice = () => {
    if (serviceType === 'drone') {
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
    } else {
      // Equipment rental - daily rate
      const selectedEquip = equipment.find((e) => e.id === selectedEquipment)
      if (selectedEquip) {
        setTotalPrice(selectedEquip.rental_price_per_day)
        setDepositAmount(selectedEquip.deposit_amount)
      } else {
        setTotalPrice(0)
        setDepositAmount(0)
      }
    }
  }

  const handleGetLocation = async () => {
    setGettingLocation(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const gpsCoords = `${latitude}, ${longitude}`
            setFormData({ ...formData, gpsCoordinates: gpsCoords })
            setGettingLocation(false)
          },
          (error) => {
            console.error("Error getting location:", error)
            alert("ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาเปิดใช้งาน GPS")
            setGettingLocation(false)
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      } else {
        alert("เบราว์เซอร์ไม่รองรับการเข้าถึงตำแหน่ง")
        setGettingLocation(false)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("เกิดข้อผิดพลาดในการเข้าถึงตำแหน่ง")
      setGettingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.customerName.trim()) {
      alert("กรุณากรอกชื่อ-นามสกุล")
      return
    }

    if (!formData.phoneNumber.trim()) {
      alert("กรุณากรอกเบอร์โทรศัพท์")
      return
    }

    if (serviceType === 'drone') {
      if (!formData.areaSize) {
        alert("กรุณากรอกจำนวนไร่")
        return
      }

      if (!formData.cropType) {
        alert("กรุณาเลือกชนิดพืช")
        return
      }

      if (!formData.sprayType) {
        alert("กรุณาเลือกชนิดสารพ่น")
        return
      }

      if (!formData.gpsCoordinates.trim()) {
        alert("กรุณาระบุที่อยู่ หรือใช้ GPS แชร์ตำแหน่ง")
        return
      }
    } else {
      if (!selectedEquipment) {
        alert("กรุณาเลือกเครื่องจักร")
        return
      }
    }

    if (!formData.selectedDate) {
      alert("กรุณาเลือกวันที่ต้องการใช้บริการ")
      return
    }

    // ตรวจสอบกฎ 3 วันล่วงหน้า
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 3)
    minDate.setHours(0, 0, 0, 0)
    
    const selectedDate = new Date(formData.selectedDate)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate < minDate) {
      alert(`กรุณาเลือกวันที่อย่างน้อย 3 วันล่วงหน้า\nวันที่เร็วที่สุดที่สามารถจองได้: ${minDate.toLocaleDateString("th-TH")}`)
      return
    }

    // Show confirmation dialog
    const confirmed = confirm(`ยืนยันการจองบริการ?\n\nข้อมูลสรุป:\n- ลูกค้า: ${formData.customerName}\n- เบอร์โทร: ${formData.phoneNumber}\n- จำนวนไร่: ${formData.areaSize}\n- ราคารวม: ${totalPrice.toLocaleString()} บาท\n- มัดจำ: ${depositAmount.toLocaleString()} บาท`)
    
    if (!confirmed) {
      return
    }

    setIsSubmitting(true)

    const bookingData = serviceType === 'drone'
      ? {
          ...formData,
          lineUserId,
          totalPrice,
          depositAmount,
          status: "pending_payment",
          createdAt: new Date().toISOString(),
          booking_type: "service",
        }
      : {
          customerName: formData.customerName,
          phoneNumber: formData.phoneNumber,
          selectedDate: formData.selectedDate,
          notes: formData.notes,
          lineUserId,
          totalPrice,
          depositAmount,
          status: "pending_payment",
          createdAt: new Date().toISOString(),
          booking_type: "rental",
          equipment_id: selectedEquipment,
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
        setIsSubmitting(false)
        // ไม่ alert, ไม่ redirect
      } else {
        setIsSubmitting(false)
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
      }
    } catch (error) {
      console.error("Error:", error)
      setIsSubmitting(false)
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/drone-service-login-logo.webp"
              alt="โลโก้ บ.พระพิรุนทร์ เซอร์วิส โพรไวเดอร์ จก."
              width={150}
              height={60}
              className="h-12 w-auto"
            />
          </div>
        </div>
        
        {/* LIFF Success Message - แสดงเสมอ */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm text-center">✅ ระบบพร้อมใช้งาน</p>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">จองบริการทางการเกษตร</h1>
          <p className="text-gray-600">เลือกประเภทบริการและกรอกข้อมูล</p>

          {/* My Bookings Link */}
          <div className="mt-4">
            <Link href="/line/liff/my-bookings" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <FileText className="h-4 w-4" />
              ดูรายการจองของฉัน
            </Link>
          </div>
        </div>

        {/* Service Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>เลือกประเภทบริการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setServiceType('drone')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  serviceType === 'drone'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Zap className={`w-8 h-8 ${serviceType === 'drone' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold ${serviceType === 'drone' ? 'text-green-700' : 'text-gray-600'}`}>
                    พ่นยาโดรน
                  </span>
                  <span className="text-xs text-gray-500">บริการพ่นยาด้วยโดรน</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('equipment')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  serviceType === 'equipment'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Truck className={`w-8 h-8 ${serviceType === 'equipment' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold ${serviceType === 'equipment' ? 'text-blue-700' : 'text-gray-600'}`}>
                    เช่าเครื่องจักร
                  </span>
                  <span className="text-xs text-gray-500">เช่ารถไถ รถเกี่ยว ฯลฯ</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
        {showQR ? (
          <div className="flex flex-col items-center justify-center py-8">
            {/* Logo ในหน้า QR */}
            <div className="mb-6">
              <Image
                src="/images/drone-service-login-logo.webp"
                alt="โลโก้ บ.พระพิรุนทร์"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-green-700">ชำระเงินมัดจำ</h2>
            <Image src="/images/Drone Booking Service.png" alt="PromptPay QR" width={320} height={320} className="rounded-lg border" />
            <div className="mt-4 text-xl font-semibold text-green-700">ยอดมัดจำที่ต้องชำระ: {lastDeposit.toLocaleString()} บาท</div>
            <div className="mt-2 text-gray-600 text-center">กรุณาสแกน QR เพื่อชำระเงินมัดจำ<br/>หลังชำระเงินแล้วรอเจ้าหน้าที่ตรวจสอบสถานะ</div>
            
            <div className="mt-6 flex gap-3">
              <button className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowQR(false)}>
                กลับสู่หน้าจอง
              </button>
              <Link href="/line/liff/my-bookings">
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  ดูรายการจองของฉัน
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">{/* แสดงฟอร์มเสมอ ไม่เช็คเงื่อนไข LIFF */}
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

            {/* Service Details - Conditional based on service type */}
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดบริการ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceType === 'drone' ? (
                  <>
                    {/* Drone Service Fields */}
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
                            {cropTypes.length === 0 ? (
                              <SelectItem value="no-data" disabled>
                                ไม่พบข้อมูลชนิดพืช
                              </SelectItem>
                            ) : (
                              cropTypes.map((crop) => (
                                <SelectItem key={crop.id} value={crop.id}>
                                  {crop.name} ({crop.pricePerRai ? `${crop.pricePerRai} บาท/ไร่` : 'ไม่ระบุราคา'})
                                </SelectItem>
                              ))
                            )}
                            {loadingTypes && (
                              <div className="px-2 py-1 text-xs text-blue-600 italic">
                                🔄 กำลังอัพเดทข้อมูลล่าสุด...
                              </div>
                            )}
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
                            {sprayTypes.length === 0 ? (
                              <SelectItem value="no-data" disabled>
                                ไม่พบข้อมูลสารพ่น
                              </SelectItem>
                            ) : (
                              sprayTypes.map((spray) => (
                                <SelectItem key={spray.id} value={spray.id}>
                                  {spray.name} ({spray.pricePerRai ? `${spray.pricePerRai} บาท/ไร่` : 'ไม่ระบุราคา'})
                                </SelectItem>
                              ))
                            )}
                            {loadingTypes && (
                              <div className="px-2 py-1 text-xs text-blue-600 italic">
                                🔄 กำลังอัพเดทข้อมูลล่าสุด...
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="gpsCoordinates">ที่อยู่/พิกัด GPS *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="gpsCoordinates"
                          placeholder="ระบุที่อยู่ หรือพิกัด GPS"
                          value={formData.gpsCoordinates}
                          onChange={(e) => setFormData({ ...formData, gpsCoordinates: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetLocation}
                          disabled={gettingLocation}
                          className="px-3"
                          title="ใช้ตำแหน่งปัจจุบัน"
                        >
                          {gettingLocation ? (
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          ) : (
                            <Navigation className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {formData.gpsCoordinates && formData.gpsCoordinates.includes(',') && (
                        <p className="text-sm text-green-600 mt-1">
                          📍 พิกัด GPS ถูกบันทึกแล้ว
                        </p>
                      )}
                      {formData.gpsCoordinates && !formData.gpsCoordinates.includes(',') && (
                        <p className="text-sm text-gray-500 mt-1">
                          📍 ที่อยู่ที่ระบุ
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Equipment Rental Fields */}
                    <div>
                      <Label htmlFor="equipment">เลือกเครื่องจักร *</Label>
                      <Select
                        value={selectedEquipment}
                        onValueChange={(value) => setSelectedEquipment(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกเครื่องจักรที่ต้องการเช่า" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipment.length === 0 ? (
                            <SelectItem value="no-data" disabled>
                              ไม่พบเครื่องจักรพร้อมให้เช่า
                            </SelectItem>
                          ) : (
                            equipment.map((equip) => (
                              <SelectItem key={equip.id} value={equip.id}>
                                {equip.name} - {equip.model} (฿{equip.rental_price_per_day.toLocaleString()}/วัน)
                              </SelectItem>
                            ))
                          )}
                          {loadingTypes && (
                            <div className="px-2 py-1 text-xs text-blue-600 italic">
                              🔄 กำลังโหลดข้อมูล...
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {selectedEquipment && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          {(() => {
                            const selected = equipment.find(e => e.id === selectedEquipment)
                            return selected ? (
                              <div className="space-y-1 text-sm">
                                <p className="font-semibold text-blue-900">{selected.name}</p>
                                <p className="text-gray-600">รุ่น: {selected.model}</p>
                                {selected.category && <p className="text-gray-600">ประเภท: {selected.category.name}</p>}
                                <p className="text-green-600 font-medium">ค่าเช่า: ฿{selected.rental_price_per_day.toLocaleString()}/วัน</p>
                                <p className="text-orange-600">เงินมัดจำ: ฿{selected.deposit_amount.toLocaleString()}</p>
                              </div>
                            ) : null
                          })()}
                        </div>
                      )}
                    </div>
                  </>
                )}
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
                    <div className="mb-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      ⚠️ กรุณาจองล่วงหน้าอย่างน้อย 3 วัน เพื่อให้เจ้าหน้าที่เตรียมการได้เหมาะสม
                    </div>
                    <Calendar
                      mode="single"
                      selected={formData.selectedDate}
                      onSelect={(date) => setFormData({ ...formData, selectedDate: date })}
                      locale={th}
                      disabled={(date) => {
                        if (!date) return false
                        const today = new Date()
                        const minDate = new Date(today)
                        minDate.setDate(today.getDate() + 3) // เพิ่ม 3 วัน
                        minDate.setHours(0, 0, 0, 0) // ตั้งเป็นเที่ยงคืน
                        date.setHours(0, 0, 0, 0) // ตั้งเป็นเที่ยงคืน
                        return date < minDate
                      }}
                      className="w-full rounded-md border"
                    />
                    {formData.selectedDate && (
                      <div className="mt-2 text-center text-green-700 font-semibold">
                        วันที่ที่เลือก: {formData.selectedDate.toLocaleDateString("th-TH")}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      วันที่เร็วที่สุดที่สามารถจองได้: {(() => {
                        const minDate = new Date()
                        minDate.setDate(minDate.getDate() + 3)
                        return minDate.toLocaleDateString("th-TH")
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Summary */}
            {(totalPrice > 0 || depositAmount > 0) && (
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
                      <span>{serviceType === 'drone' ? 'ราคารวมทั้งหมด:' : 'ค่าเช่าต่อวัน:'}</span>
                      <span className="font-semibold">{totalPrice.toLocaleString()} บาท</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-600">
                      <span>ยอดมัดจำ{serviceType === 'drone' ? ' (30%)' : ''}:</span>
                      <span>{depositAmount.toLocaleString()} บาท</span>
                    </div>
                    {serviceType === 'equipment' && (
                      <p className="text-xs text-gray-500 mt-2">
                        * สำหรับการเช่าเครื่องจักร ค่าเช่าจะคำนวณตามจำนวนวันที่เช่าจริง
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

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
              <Button 
                type="submit" 
                size="lg" 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    ยืนยันการจองและชำระเงิน
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}