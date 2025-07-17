import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Users, Calendar, BarChart3 } from "lucide-react"
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/admin/login")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ระบบบริการจ้างพ่นยาโดรน</h1>
          <p className="text-xl text-gray-600 mb-8">บริการพ่นยาด้วยโดรนที่ทันสมัย รวดเร็ว และมีประสิทธิภาพ</p>
          <div className="flex gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                จองบริการ
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <CardTitle>โดรนทันสมัย</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">โดรน 6 ลำพร้อมให้บริการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>นักบินมืออาชีพ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">ทีมนักบินที่มีประสบการณ์</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>จองง่าย</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">ระบบจองออนไลน์ที่สะดวก</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-orange-600 mb-2" />
              <CardTitle>รายงานผล</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">ติดตามผลการพ่นยาแบบเรียลไทม์</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">ราคาบริการ</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">ข้าว</h3>
              <p className="text-2xl font-bold text-green-600">50 บาท/ไร่</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">อ้อย</h3>
              <p className="text-2xl font-bold text-green-600">70 บาท/ไร่</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">ทุเรียน</h3>
              <p className="text-2xl font-bold text-green-600">100 บาท/ไร่</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">มันสำปะหลัง</h3>
              <p className="text-2xl font-bold text-green-600">70 บาท/ไร่</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
