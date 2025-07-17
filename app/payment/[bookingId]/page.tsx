"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Upload, CheckCircle } from "lucide-react"
import { useParams } from "next/navigation"

interface BookingDetails {
  id: string
  customerName: string
  totalPrice: number
  depositAmount: number
  cropType: string
  sprayType: string
  areaSize: number
}

export default function PaymentPage() {
  const params = useParams()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    // Mock booking details - in production, fetch from database
    setBooking({
      id: bookingId,
      customerName: "นายสมชาย ใจดี",
      totalPrice: 750,
      depositAmount: 225,
      cropType: "ข้าว",
      sprayType: "ปุ๋ย",
      areaSize: 5,
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPaymentSlip(file)
    }
  }

  const handlePaymentSubmit = async () => {
    if (!paymentSlip) {
      alert("กรุณาอัปโหลดสลิปการโอนเงิน")
      return
    }

    setIsUploading(true)

    try {
      // In production, upload file to storage and update booking status
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate upload

      setPaymentComplete(true)

      // Send LINE notification to customer and admin
      // Update booking status in database
    } catch (error) {
      console.error("Error uploading payment slip:", error)
      alert("เกิดข้อผิดพลาดในการอัปโหลด")
    } finally {
      setIsUploading(false)
    }
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-600">ชำระเงินสำเร็จ!</CardTitle>
            <CardDescription>เราได้รับการชำระเงินมัดจำของคุณแล้ว</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>
              รหัสการจอง: <strong>{bookingId}</strong>
            </p>
            <p>
              ยอดมัดจำ: <strong>฿{booking?.depositAmount.toLocaleString()}</strong>
            </p>
            <p className="text-sm text-gray-600">เราจะติดต่อกลับเพื่อยืนยันการนัดหมายในเร็วๆ นี้</p>
            <Button className="w-full" onClick={() => (window.location.href = "/")}>
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ชำระเงินมัดจำ</h1>
          <p className="text-gray-600">รหัสการจอง: {bookingId}</p>
        </div>

        {/* Booking Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>สรุปการจอง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ลูกค้า:</span>
                <span className="font-medium">{booking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>บริการ:</span>
                <span className="font-medium">
                  {booking.cropType} - {booking.sprayType}
                </span>
              </div>
              <div className="flex justify-between">
                <span>พื้นที่:</span>
                <span className="font-medium">{booking.areaSize} ไร่</span>
              </div>
              <div className="flex justify-between">
                <span>ราคารวม:</span>
                <span className="font-medium">฿{booking.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                <span>ยอดมัดจำ (30%):</span>
                <span>฿{booking.depositAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Payment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              ชำระเงินผ่าน QR Code
            </CardTitle>
            <CardDescription>สแกน QR Code เพื่อโอนเงินมัดจำ</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 mb-4">
              <div className="w-48 h-48 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
                <QrCode className="h-24 w-24 text-gray-400" />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                QR Code สำหรับโอนเงิน ฿{booking.depositAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>ธนาคาร:</strong> กสิกรไทย
              </p>
              <p>
                <strong>เลขที่บัญชี:</strong> 123-4-56789-0
              </p>
              <p>
                <strong>ชื่อบัญชี:</strong> บริษัท โดรนเซอร์วิส จำกัด
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Payment Slip */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              อัปโหลดสลิปการโอนเงิน
            </CardTitle>
            <CardDescription>อัปโหลดสลิปการโอนเงินเพื่อยืนยันการชำระ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paymentSlip">เลือกไฟล์สลิป</Label>
              <Input id="paymentSlip" type="file" accept="image/*" onChange={handleFileUpload} className="mt-1" />
            </div>

            {paymentSlip && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  <strong>ไฟล์ที่เลือก:</strong> {paymentSlip.name}
                </p>
                <p className="text-sm text-green-600">ขนาด: {(paymentSlip.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}

            <Button onClick={handlePaymentSubmit} disabled={!paymentSlip || isUploading} className="w-full">
              {isUploading ? "กำลังอัปโหลด..." : "ยืนยันการชำระเงิน"}
            </Button>

            <p className="text-xs text-gray-500 text-center">หลังจากอัปโหลดสลิป เราจะตรวจสอบและยืนยันการชำระภายใน 30 นาที</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
