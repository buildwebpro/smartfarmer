"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tractor, Users, Building2, Sprout } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const handleLineLogin = (role: string) => {
    // Save selected role to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selected_role', role)
    }

    // Redirect to LINE Login
    const LINE_CHANNEL_ID = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID || '2007773973'
    const CALLBACK_URL = encodeURIComponent(
      process.env.NEXT_PUBLIC_LINE_CALLBACK_URL ||
      `${window.location.origin}/auth/callback`
    )
    const STATE = Math.random().toString(36).substring(7)

    // Save state for verification
    sessionStorage.setItem('line_state', STATE)

    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
      `response_type=code` +
      `&client_id=${LINE_CHANNEL_ID}` +
      `&redirect_uri=${CALLBACK_URL}` +
      `&state=${STATE}` +
      `&scope=profile%20openid%20email`

    window.location.href = lineLoginUrl
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sprout className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800">SmartFarmer</h1>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/login')}>
            Admin Login
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          แพลตฟอร์ม Marketplace
          <br />
          <span className="text-green-600">สำหรับเกษตรกร</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          เชื่อมโยงเกษตรกรกับผู้ให้บริการ ทั้งการจ้างงาน และเช่าเครื่องจักรการเกษตร
        </p>

        {/* Quick Action - Drone Booking */}
        <div className="mb-8">
          <Link href="/line/liff/booking">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Tractor className="h-6 w-6 mr-3" />
              จ้างงานพ่นยาโดรน
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">เชื่อมต่อผ่าน LINE</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">ปลอดภัย รวดเร็ว</span>
          </div>
        </div>

        {/* Role Selection */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            เลือกบทบาทของคุณ
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Farmer Card */}
            <Card
              className={`cursor-pointer transition-all hover:shadow-xl ${
                selectedRole === 'farmer'
                  ? 'ring-4 ring-green-500 bg-green-50'
                  : 'hover:border-green-300'
              }`}
              onClick={() => setSelectedRole('farmer')}
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-6 bg-green-100 rounded-full">
                    <Tractor className="h-16 w-16 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">
                  เกษตรกร (Farmer)
                </CardTitle>
                <CardDescription className="text-center text-base">
                  จ้างผู้เชี่ยวชาญและเช่าเครื่องจักร
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    โพสต์งานหาผู้รับจ้าง
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    เช่าเครื่องจักรการเกษตร
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    จัดการปฏิทินเพาะปลูก
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    รีวิวและเรตติ้ง
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Provider Card */}
            <Card
              className={`cursor-pointer transition-all hover:shadow-xl ${
                selectedRole === 'provider'
                  ? 'ring-4 ring-blue-500 bg-blue-50'
                  : 'hover:border-blue-300'
              }`}
              onClick={() => setSelectedRole('provider')}
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-6 bg-blue-100 rounded-full">
                    <Users className="h-16 w-16 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">
                  ผู้ให้บริการ (Provider)
                </CardTitle>
                <CardDescription className="text-center text-base">
                  หางานและให้บริการเกษตรกร
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    ค้นหางานใกล้ๆ คุณ
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    ส่งข้อเสนอแข่งขัน
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    สร้างโปรไฟล์มืออาชีพ
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    รับรีวิวและสร้างชื่อเสียง
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* LINE Login Button */}
        {selectedRole && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
            <Button
              size="lg"
              onClick={() => handleLineLogin(selectedRole)}
              className="bg-[#06C755] hover:bg-[#05B34A] text-white text-lg px-12 py-6 rounded-full shadow-lg"
            >
              <svg
                className="w-6 h-6 mr-3"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              เข้าสู่ระบบด้วย LINE
            </Button>
            <p className="text-sm text-gray-500">
              คุณเลือก: {selectedRole === 'farmer' ? 'เกษตรกร' : 'ผู้ให้บริการ'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Booking CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ต้องการจ้างพ่นยาโดรนด่วน?
          </h2>
          <p className="text-blue-100 text-lg mb-6">
            จองบริการพ่นยาโดรนได้ทันที ผ่าน LINE ไม่ต้องสมัครสมาชิก
          </p>
          <Link href="/line/liff/booking">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-10 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all"
            >
              <Tractor className="h-6 w-6 mr-3" />
              จ้างงานพ่นยาโดรนตอนนี้
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ทำไมต้อง SmartFarmer?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                <Tractor className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">หาช่างง่าย</h3>
              <p className="text-gray-600">
                โพสต์งานครั้งเดียว รับข้อเสนอจากผู้เชี่ยวชาญหลายคน เลือกได้เลย
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ปลอดภัย</h3>
              <p className="text-gray-600">
                ระบบรีวิว verified badge และ escrow payment คุ้มครองทุกฝ่าย
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
                <Building2 className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ครบจบ</h3>
              <p className="text-gray-600">
                ทั้งจ้างงาน เช่าเครื่องจักร และจัดการฟาร์มในที่เดียว
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 SmartFarmer - Marketplace for Agriculture</p>
        </div>
      </div>
    </div>
  )
}
