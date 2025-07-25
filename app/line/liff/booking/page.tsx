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
import { MapPin, Calculator, CreditCard, Navigation, FileText } from "lucide-react"
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
  const [gettingLocation, setGettingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [liffReady, setLiffReady] = useState(false)
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
    // ดึงข้อมูลชนิดพืชและสารพ่นจาก API
    const fetchTypes = async () => {
      setLoadingTypes(true) // เริ่มแสดงสถานะ loading
      try {
        // ดึงข้อมูลพร้อมกัน
        const [cropResponse, sprayResponse] = await Promise.all([
          fetch("/api/crop-types"),
          fetch("/api/spray-types")
        ])
        
        const [cropResult, sprayResult] = await Promise.all([
          cropResponse.json(),
          sprayResponse.json()
        ])
        
        // อัพเดทข้อมูลใหม่จาก API หากมี
        if (cropResult.data && cropResult.data.length > 0) {
          setCropTypes(cropResult.data)
        }
        
        if (sprayResult.data && sprayResult.data.length > 0) {
          setSprayTypes(sprayResult.data)
        }
      } catch (error) {
        console.error("Error fetching types:", error)
        // คงข้อมูลเริ่มต้นไว้หาก API ล้มเหลว
      } finally {
        setLoadingTypes(false)
      }
    }
    fetchTypes()
    
    // Initialize LIFF และดึง LINE USER ID
    const initializeLiff = async () => {
      if (typeof window !== "undefined" && (window as any).liff) {
        const liff = (window as any).liff
        try {
          // Initialize LIFF with your LIFF ID
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2007773973-O2pXnA5n' })
          setLiffReady(true)
          
          if (!liff.isLoggedIn()) {
            liff.login()
          } else {
            const profile = await liff.getProfile()
            setLineUserId(profile.userId)
            console.log('LIFF initialized successfully. User ID:', profile.userId)
          }
        } catch (error) {
          console.error('LIFF initialization failed:', error)
          setLiffError('ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาเปิดในแอป LINE')
        }
      } else {
        console.warn('LIFF SDK not loaded')
        setLiffError('กำลังโหลด LINE SDK...')
      }
    }
    
    // รอให้ LIFF SDK โหลดเสร็จก่อน
    if (typeof window !== "undefined") {
      // ตรวจสอบ URL parameters จาก LIFF callback
      const urlParams = new URLSearchParams(window.location.search)
      const liffCode = urlParams.get('code')
      const liffState = urlParams.get('state')
      
      if (liffCode) {
        console.log('LIFF callback detected with code:', liffCode)
        // ลบ parameters ออกจาก URL เพื่อให้ URL สะอาด
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, document.title, cleanUrl)
      }
      
      const checkLiffReady = () => {
        if ((window as any).liff) {
          initializeLiff()
        } else {
          setTimeout(checkLiffReady, 100)
        }
      }
      checkLiffReady()
    }
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
              src="https://drone-booking-app.vercel.app/images/drone-service-login-logo.webp" 
              alt="โลโก้ บ.พระพิรุนทร์ เซอร์วิส โพรไวเดอร์ จก." 
              width={150} 
              height={60} 
              className="h-12 w-auto"
            />
          </div>
        </div>
        
        {/* LIFF Error */}
        {liffError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">⚠️ {liffError}</p>
          </div>
        )}
        
        {/* LIFF Loading */}
        {!liffReady && !liffError && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-center">🔄 กำลังเชื่อมต่อกับ LINE...</p>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">จองบริการพ่นยาโดรน</h1>
          <p className="text-gray-600">กรอกข้อมูลเพื่อจองบริการพ่นยาโดรน</p>
          
          {/* My Bookings Link */}
          <div className="mt-4">
            <Link href="/line/liff/my-bookings" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <FileText className="h-4 w-4" />
              ดูรายการจองของฉัน
            </Link>
          </div>
        </div>
        {showQR ? (
          <div className="flex flex-col items-center justify-center py-8">
            {/* Logo ในหน้า QR */}
            <div className="mb-6">
              <Image 
                src="https://drone-booking-app.vercel.app/images/drone-service-login-logo.webp" 
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