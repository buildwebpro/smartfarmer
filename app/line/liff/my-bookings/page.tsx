"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, Phone, User, Clock, Banknote, FileText, ArrowLeft, Upload, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Booking {
  id: string
  booking_code: string
  customer_name: string
  customer_phone: string
  area_size: number
  gps_coordinates: string
  scheduled_date: string
  scheduled_time: string
  notes: string
  total_price: number
  deposit_amount: number
  status: string
  created_at: string
  payment_slip_url?: string
}

export default function BookingStatusPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [lineUserId, setLineUserId] = useState<string>("")
  const [uploadingSlip, setUploadingSlip] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadDialog, setUploadDialog] = useState<string | null>(null)

  useEffect(() => {
    // ใช้ guest user system แทน LIFF authentication
    const getGuestUserId = () => {
      const userId = localStorage.getItem('guest_user_id');
      if (userId) {
        console.log('🔄 [USER] Retrieved guest user ID for bookings:', userId);
        setLineUserId(userId);
        fetchUserBookings(userId);
      } else {
        console.log('❌ [USER] No guest user ID found - user needs to make a booking first');
        setLoading(false);
        // ไม่มี user ID หมายความว่ายังไม่เคยจอง
      }
    };
    
    getGuestUserId();
  }, [])

  const fetchUserBookings = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/bookings/user/${userId}`)
      const result = await response.json()
      if (result.success) {
        setBookings(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_payment: { label: "รอชำระเงิน", color: "bg-yellow-500" },
      paid: { label: "ชำระแล้ว", color: "bg-green-500" },
      assigned: { label: "มอบหมายงาน", color: "bg-blue-500" },
      in_progress: { label: "กำลังดำเนินการ", color: "bg-purple-500" },
      completed: { label: "เสร็จสิ้น", color: "bg-emerald-500" },
      cancelled: { label: "ยกเลิก", color: "bg-red-500" }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: "bg-gray-500" }
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    )
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const uploadPaymentSlip = async (bookingId: string) => {
    if (!selectedFile) return

    setUploadingSlip(bookingId)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('bookingId', bookingId)

      const response = await fetch('/api/upload/payment-slip', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // อัพเดทข้อมูลการจองใน state
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, payment_slip_url: result.imageUrl, status: 'paid' }
            : booking
        ))
        setUploadDialog(null)
        setSelectedFile(null)
        alert('อัพโหลดสลิปการโอนเงินสำเร็จ!')
      } else {
        alert('เกิดข้อผิดพลาดในการอัพโหลด: ' + result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('เกิดข้อผิดพลาดในการอัพโหลด')
    }
    
    setUploadingSlip(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long", 
      day: "numeric",
      weekday: "long"
    })
  }

  const formatTime = (timeString: string) => {
    return timeString ? timeString.slice(0, 5) + " น." : ""
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">รายการจองของฉัน</h1>
          <p className="text-gray-600">ตรวจสอบสถานะการจองบริการพ่นยาโดรน</p>
        </div>

        {/* Back to Booking Button */}
        <div className="mb-6">
          <Link href="/line/liff/booking">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              จองบริการใหม่
            </Button>
          </Link>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 mx-auto border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              {lineUserId ? (
                <>
                  <p className="text-gray-500 mb-4">ยังไม่มีการจองบริการ</p>
                  <Link href="/line/liff/booking">
                    <Button>จองบริการเลย</Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-gray-500 mb-4">ไม่พบประวัติการจอง</p>
                  <p className="text-sm text-gray-400 mb-4">กรุณาทำการจองผ่านระบบก่อน เพื่อดูประวัติการจอง</p>
                  <Link href="/line/liff/booking">
                    <Button>เริ่มจองบริการ</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        รหัสจอง: {booking.booking_code}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        จองเมื่อ: {formatDate(booking.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{booking.customer_name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {booking.customer_phone}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {booking.scheduled_date ? formatDate(booking.scheduled_date) : "ยังไม่กำหนด"}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(booking.scheduled_time)}
                      </p>
                    </div>
                  </div>

                  {/* Area and Location */}
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{booking.area_size} ไร่</p>
                      {booking.gps_coordinates && (
                        <p className="text-sm text-gray-500">
                          📍 {booking.gps_coordinates.includes(',') ? 'พิกัด GPS' : 'ที่อยู่ที่ระบุ'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="flex items-center gap-3">
                    <Banknote className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">ราคารวม: {booking.total_price.toLocaleString()} บาท</p>
                      <p className="text-sm text-gray-500">
                        มัดจำ: {booking.deposit_amount.toLocaleString()} บาท
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {booking.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status === 'pending_payment' && (
                    <div className="pt-2 border-t space-y-3">
                      {!booking.payment_slip_url ? (
                        <Dialog open={uploadDialog === booking.id} onOpenChange={(open) => setUploadDialog(open ? booking.id : null)}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              แนบสลิปการโอนเงิน
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>อัพโหลดสลิปการโอนเงิน</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="text-sm text-gray-600">
                                <p>ยอดมัดจำ: <span className="font-semibold text-green-600">{booking.deposit_amount?.toLocaleString()} บาท</span></p>
                                <p className="mt-1">กรุณาโอนเงินและแนบสลิปการโอนเงิน</p>
                              </div>
                              
                              <div>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="cursor-pointer"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  รองรับไฟล์รูปภาพ ขนาดไม่เกิน 5MB
                                </p>
                              </div>

                              {selectedFile && (
                                <div className="text-sm text-green-600">
                                  ✓ เลือกไฟล์: {selectedFile.name}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setUploadDialog(null)
                                    setSelectedFile(null)
                                  }}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  ยกเลิก
                                </Button>
                                <Button
                                  onClick={() => uploadPaymentSlip(booking.id)}
                                  disabled={!selectedFile || uploadingSlip === booking.id}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  {uploadingSlip === booking.id ? (
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                      กำลังอัพโหลด...
                                    </div>
                                  ) : (
                                    'อัพโหลด'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">ส่งสลิปการโอนเงินแล้ว</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">รอการตรวจสอบจากแอดมิน</p>
                        </div>
                      )}
                    </div>
                  )}

                  {booking.status === 'paid' && booking.payment_slip_url && (
                    <div className="pt-2 border-t">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">ชำระเงินเรียบร้อยแล้ว</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">รอการมอบหมายงานให้โดรน</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
