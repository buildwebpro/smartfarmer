"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Phone, User, Clock, Banknote, FileText, ArrowLeft } from "lucide-react"
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
}

export default function BookingStatusPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [lineUserId, setLineUserId] = useState<string>("")

  useEffect(() => {
    // ดึง LINE USER ID จาก LIFF SDK
    const getLineUserId = async () => {
      if (typeof window !== "undefined" && (window as any).liff) {
        const liff = (window as any).liff
        try {
          await liff.init({ liffId: "YOUR_LIFF_ID" }) // ใส่ LIFF ID จริง
          if (!liff.isLoggedIn()) {
            liff.login()
          } else {
            const profile = await liff.getProfile()
            setLineUserId(profile.userId)
            fetchUserBookings(profile.userId)
          }
        } catch (error) {
          console.error("LIFF initialization failed:", error)
          // สำหรับ testing ใช้ mock user id
          const mockUserId = "test-user-id"
          setLineUserId(mockUserId)
          fetchUserBookings(mockUserId)
        }
      } else {
        // สำหรับ testing ใช้ mock user id
        const mockUserId = "test-user-id"
        setLineUserId(mockUserId)
        fetchUserBookings(mockUserId)
      }
    }

    getLineUserId()
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
              src="https://drone-booking-app.vercel.app/images/drone-service-login-logo.webp" 
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
              <p className="text-gray-500 mb-4">ยังไม่มีการจองบริการ</p>
              <Link href="/line/liff/booking">
                <Button>จองบริการเลย</Button>
              </Link>
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
                    <div className="pt-2 border-t">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        ชำระเงินมัดจำ
                      </Button>
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
