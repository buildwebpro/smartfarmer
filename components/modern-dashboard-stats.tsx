"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  ShoppingCart,
  Zap,
  MapPin,
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalArea: number
  activeOrders: number
  availableDrones: number
  completedToday: number
  totalCustomers: number
  averageOrderValue: number
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  color: "emerald" | "blue" | "purple" | "orange" | "cyan" | "rose"
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, color }: StatsCardProps) {
  const colorClasses = {
    emerald: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    blue: "bg-gradient-to-r from-blue-500 to-blue-600",
    purple: "bg-gradient-to-r from-purple-500 to-purple-600",
    orange: "bg-gradient-to-r from-orange-500 to-orange-600",
    cyan: "bg-gradient-to-r from-cyan-500 to-cyan-600",
    rose: "bg-gradient-to-r from-rose-500 to-rose-600"
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
              <CardDescription className="text-sm text-gray-500">{subtitle}</CardDescription>
            </div>
          </div>
          {trend && (
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className={`${trend.isPositive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}`}
            >
              {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {trend.value}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        {trend && (
          <div className="text-sm text-gray-500">
            {trend.isPositive ? 'เพิ่มขึ้น' : 'ลดลง'} {trend.value}% จากเดือนที่แล้ว
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface DashboardStatsGridProps {
  stats: DashboardStats
}

export function ModernDashboardStats({ stats }: DashboardStatsGridProps) {
  const statsCards = [
    {
      title: "รายได้รวม",
      value: `฿${stats.totalRevenue.toLocaleString()}`,
      subtitle: "รายได้สะสม",
      icon: DollarSign,
      color: "emerald" as const,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "ออร์เดอร์ทั้งหมด",
      value: stats.totalOrders,
      subtitle: "รายการจองทั้งหมด",
      icon: ShoppingCart,
      color: "blue" as const,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "ลูกค้าทั้งหมด",
      value: stats.totalCustomers,
      subtitle: "ลูกค้าที่ลงทะเบียน",
      icon: Users,
      color: "purple" as const,
      trend: { value: 15, isPositive: true }
    },
    {
      title: "พื้นที่รวม",
      value: `${stats.totalArea} ไร่`,
      subtitle: "พื้นที่ที่พ่นแล้ว",
      icon: MapPin,
      color: "cyan" as const,
      trend: { value: 20, isPositive: true }
    },
    {
      title: "ออร์เดอร์ที่รอ",
      value: stats.activeOrders,
      subtitle: "รอดำเนินการ",
      icon: Clock,
      color: "orange" as const
    },
    {
      title: "โดรนพร้อมใช้",
      value: `${stats.availableDrones}/6`,
      subtitle: "ลำที่พร้อมใช้งาน",
      icon: Zap,
      color: "rose" as const
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  )
}
