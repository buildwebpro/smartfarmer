"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

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

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">รายการจองบริการ (Order)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead className="text-center">ชื่อ</TableHead>
                  <TableHead className="text-center">LINE USER ID</TableHead>
                  <TableHead className="text-center">วันที่จอง</TableHead>
                  <TableHead className="text-center">ยอดมัดจำ</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                  <TableHead className="text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">ไม่พบข้อมูล</TableCell>
                  </TableRow>
                ) : (
                  orders.map((order, idx) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-center">{idx + 1}</TableCell>
                      <TableCell className="text-center">{order.customer_name}</TableCell>
                      <TableCell className="text-center">{order.line_user_id}</TableCell>
                      <TableCell className="text-center">{order.selected_date ? new Date(order.selected_date).toLocaleDateString("th-TH") : "-"}</TableCell>
                      <TableCell className="text-center text-green-700 font-semibold">{order.deposit_amount?.toLocaleString()} บาท</TableCell>
                      <TableCell className="text-center">{order.status}</TableCell>
                      <TableCell className="text-center">
                        {order.status === "pending_payment" && (
                          <Button size="sm" disabled={updatingId === order.id} onClick={() => handleUpdateStatus(order.id, "paid")}>ยืนยันรับเงิน</Button>
                        )}
                        {order.status === "paid" && (
                          <Button size="sm" variant="outline" disabled={updatingId === order.id} onClick={() => handleUpdateStatus(order.id, "in_progress")}>รอออกปฏิบัติงาน</Button>
                        )}
                        {order.status === "in_progress" && <span className="text-blue-600">ออกปฏิบัติงานแล้ว</span>}
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
  )
}
