"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ShoppingCart, Clock, CheckCircle, Play, User, Calendar, MapPin, Banknote } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface Order {
  id: string
  customer_name: string
  phone_number: string
  area_size: string
  crop_type: string
  spray_type: string
  gps_coordinates: string
  selected_date: string | null
  notes: string
  total_price: number
  deposit_amount: number
  status: string
  created_at: string
  line_user_id: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false })
    if (!error && data) setOrders(data as Order[])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    await supabase.from("bookings").update({ status: newStatus }).eq("id", id)
    await fetchOrders()
    setUpdatingId(null)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_payment: { 
        label: "รอชำระเงิน", 
        className: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-3 w-3" />
      },
      paid: { 
        label: "ชำระแล้ว", 
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3 w-3" />
      },
      in_progress: { 
        label: "กำลังดำเนินการ", 
        className: "bg-blue-100 text-blue-800",
        icon: <Play className="h-3 w-3" />
      },
      completed: { 
        label: "เสร็จสิ้น", 
        className: "bg-gray-100 text-gray-800",
        icon: <CheckCircle className="h-3 w-3" />
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_payment
    return (
      <Badge className={config.className}>
        <div className="flex items-center gap-1">
          {config.icon}
          {config.label}
        </div>
      </Badge>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              จัดการออร์เดอร์
            </h1>
            <p className="text-gray-600 mt-2">รายการจองบริการพ่นยาโดรน</p>
          </div>
        <Button 
          onClick={() => fetchOrders()} 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {loading ? "กำลังโหลด..." : "รีเฟรช"}
        </Button>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ออร์เดอร์ทั้งหมด</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-gray-500">รายการทั้งหมด</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอชำระเงิน</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending_payment').length}</div>
            <p className="text-xs text-gray-500">รายการที่รอชำระ</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ชำระแล้ว</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'paid').length}</div>
            <p className="text-xs text-gray-500">รายการที่ชำระแล้ว</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Play className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'in_progress').length}</div>
            <p className="text-xs text-gray-500">รายการที่กำลังดำเนินการ</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">รายการจองบริการ</CardTitle>
          <CardDescription>จัดการและติดตามสถานะออร์เดอร์ทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-gray-400 mb-4" />
              <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>วันที่จอง</TableHead>
                  <TableHead>พื้นที่และพืชผล</TableHead>
                  <TableHead>ตำแหน่งที่ตั้ง</TableHead>
                  <TableHead>ยอดมัดจำ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-400">ไม่พบข้อมูลออร์เดอร์</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order, idx) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{order.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>📱 {order.phone_number}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{order.selected_date ? new Date(order.selected_date).toLocaleDateString("th-TH") : "ยังไม่กำหนด"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{order.area_size} ไร่</span>
                          </div>
                          <div className="text-sm text-gray-500">{order.crop_type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {order.gps_coordinates && order.gps_coordinates.includes(',') ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 text-sm">📍 GPS</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const [lat, lng] = order.gps_coordinates.split(',').map(coord => coord.trim())
                                  window.open(`https://maps.google.com/maps?q=${lat},${lng}`, '_blank')
                                }}
                                className="text-xs px-2 py-1"
                              >
                                ดูแผนที่
                              </Button>
                            </div>
                          ) : order.gps_coordinates ? (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 text-sm">📍 ที่อยู่</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  window.open(`https://maps.google.com/maps?q=${encodeURIComponent(order.gps_coordinates)}`, '_blank')
                                }}
                                className="text-xs px-2 py-1"
                              >
                                ค้นหา
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">ไม่ระบุ</span>
                          )}
                          <div className="text-xs text-gray-400 max-w-[200px] truncate">
                            {order.gps_coordinates || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-700">{order.deposit_amount?.toLocaleString()} บาท</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {order.status === "pending_payment" && (
                            <Button 
                              size="sm" 
                              disabled={updatingId === order.id} 
                              onClick={() => handleUpdateStatus(order.id, "paid")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              ยืนยันรับเงิน
                            </Button>
                          )}
                          {order.status === "paid" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              disabled={updatingId === order.id} 
                              onClick={() => handleUpdateStatus(order.id, "in_progress")}
                            >
                              เริ่มงาน
                            </Button>
                          )}
                          {order.status === "in_progress" && (
                            <Badge className="bg-blue-100 text-blue-800">
                              กำลังดำเนินการ
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  )
}
