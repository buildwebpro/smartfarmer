"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Calendar, 
  BarChart3, 
  Settings, 
  Users, 
  Zap,
  FileText,
  DollarSign
} from "lucide-react"
import Link from "next/link"

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: "emerald" | "blue" | "purple" | "orange" | "cyan" | "rose"
  disabled?: boolean
}

const quickActions: QuickAction[] = [
  {
    title: "เพิ่มออร์เดอร์ใหม่",
    description: "สร้างรายการจองโดรนใหม่",
    href: "/admin/orders/new",
    icon: Plus,
    color: "emerald"
  },
  {
    title: "จัดตารางงาน",
    description: "กำหนดตารางการบิน",
    href: "/admin/schedule",
    icon: Calendar,
    color: "blue"
  },
  {
    title: "ดูรายงาน",
    description: "รายงานสรุปผลการดำเนินงาน",
    href: "/admin/reports",
    icon: BarChart3,
    color: "purple"
  },
  {
    title: "จัดการลูกค้า",
    description: "ข้อมูลลูกค้าและติดต่อ",
    href: "/admin/customers",
    icon: Users,
    color: "orange"
  },
  {
    title: "ตรวจสอบโดรน",
    description: "สถานะและการบำรุงรักษา",
    href: "/admin/drones",
    icon: Zap,
    color: "cyan"
  },
  {
    title: "ตั้งค่าราคา",
    description: "จัดการราคาพ่นตามชนิดพืช",
    href: "/admin/pricing",
    icon: DollarSign,
    color: "rose"
  }
]

export function ModernQuickActions() {
  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: {
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
        icon: "bg-emerald-500 text-white",
        border: "border-emerald-200",
        hover: "hover:from-emerald-100 hover:to-emerald-200"
      },
      blue: {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100",
        icon: "bg-blue-500 text-white",
        border: "border-blue-200",
        hover: "hover:from-blue-100 hover:to-blue-200"
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100",
        icon: "bg-purple-500 text-white",
        border: "border-purple-200",
        hover: "hover:from-purple-100 hover:to-purple-200"
      },
      orange: {
        bg: "bg-gradient-to-br from-orange-50 to-orange-100",
        icon: "bg-orange-500 text-white",
        border: "border-orange-200",
        hover: "hover:from-orange-100 hover:to-orange-200"
      },
      cyan: {
        bg: "bg-gradient-to-br from-cyan-50 to-cyan-100",
        icon: "bg-cyan-500 text-white",
        border: "border-cyan-200",
        hover: "hover:from-cyan-100 hover:to-cyan-200"
      },
      rose: {
        bg: "bg-gradient-to-br from-rose-50 to-rose-100",
        icon: "bg-rose-500 text-white",
        border: "border-rose-200",
        hover: "hover:from-rose-100 hover:to-rose-200"
      }
    }
    return colorMap[color as keyof typeof colorMap]
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Zap className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              การดำเนินการด่วน
            </CardTitle>
            <CardDescription className="text-gray-500">
              เครื่องมือสำหรับจัดการระบบอย่างรวดเร็ว
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            const colors = getColorClasses(action.color)
            return (
              <Link key={index} href={action.href}>
                <Card 
                  className={`group cursor-pointer transition-all duration-200 border ${colors.border} ${colors.bg} ${colors.hover} hover:shadow-lg ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-xl ${colors.icon} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
