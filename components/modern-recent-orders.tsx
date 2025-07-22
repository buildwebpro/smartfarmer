"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Clock, 
  MapPin, 
  Phone, 
  Eye, 
  Calendar,
  DollarSign,
  ChevronRight,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  customerName: string
  phoneNumber: string
  areaSize: number
  cropType: string
  sprayType: string
  totalPrice: number
  depositAmount: number
  status: "pending_payment" | "paid" | "assigned" | "completed" | "cancelled"
  scheduledDate: string
  scheduledTime: string
  createdAt: string
}

interface RecentOrdersProps {
  orders: Order[]
}

export function ModernRecentOrders({ orders }: RecentOrdersProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_payment: { 
        label: "รอชำระ", 
        className: "bg-yellow-100 text-yellow-800 border-yellow-200" 
      },
      paid: { 
        label: "ชำระแล้ว", 
        className: "bg-emerald-100 text-emerald-800 border-emerald-200" 
      },
      assigned: { 
        label: "จัดโดรน", 
        className: "bg-blue-100 text-blue-800 border-blue-200" 
      },
      completed: { 
        label: "เสร็จสิ้น", 
        className: "bg-gray-100 text-gray-800 border-gray-200" 
      },
      cancelled: { 
        label: "ยกเลิก", 
        className: "bg-red-100 text-red-800 border-red-200" 
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status || "ไม่ระบุ",
      className: "bg-gray-100 text-gray-600 border-gray-300"
    }
    
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getCustomerInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'NA'
    const words = name.trim().split(' ').filter(word => word.length > 0)
    if (words.length === 0) return 'NA'
    return words.map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                ออร์เดอร์ล่าสุด
              </CardTitle>
              <CardDescription className="text-gray-500">
                รายการจองที่เข้ามาใหม่
              </CardDescription>
            </div>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              ดูทั้งหมด
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">ไม่มีออร์เดอร์ใหม่</p>
              <p className="text-sm text-gray-400">ออร์เดอร์ใหม่จะปรากฏที่นี่</p>
            </div>
          ) : (
            orders.filter(order => order && order.id).map((order, index) => (
              <div 
                key={order.id || index} 
                className="group relative p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-emerald-100">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold">
                        {getCustomerInitials(order.customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{order.customerName || 'ไม่ระบุชื่อ'}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {order.phoneNumber || 'ไม่ระบุเบอร์'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.areaSize || '0'} ไร่
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString("th-TH") : 'ไม่ระบุวันที่'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                          {order.cropType || 'ไม่ระบุพืช'}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {order.sprayType || 'ไม่ระบุยา'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        ฿{(order.totalPrice || 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">
                        มัดจำ: ฿{(order.depositAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 p-0 hover:bg-emerald-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-xl overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                    style={{ 
                      width: order.status === 'completed' ? '100%' : 
                             order.status === 'assigned' ? '75%' : 
                             order.status === 'paid' ? '50%' : '25%' 
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
