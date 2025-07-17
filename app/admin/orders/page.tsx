"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Download, Eye } from "lucide-react"
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
  gpsCoordinates: string
  notes: string
  assignedDrone: string
  assignedPilot: string
  createdAt: string
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    // Mock data for demonstration
    const mockOrders: Order[] = [
      {
        id: "1",
        customerName: "นายสมชาย ใจดี",
        phoneNumber: "081-234-5678",
        areaSize: 5,
        cropType: "ข้าว",
        sprayType: "ปุ๋ย",
        totalPrice: 750,
        depositAmount: 225,
        status: "paid",
        scheduledDate: "2024-01-20",
        scheduledTime: "08:00",
        gpsCoordinates: "13.7563, 100.5018",
        notes: "พื้นที่ใกล้คลอง ระวังน้ำท่วม",
        assignedDrone: "โดรน #1",
        assignedPilot: "นายสมศักดิ์",
        createdAt: "2024-01-18T10:30:00Z",
      },
      {
        id: "2",
        customerName: "นางสาวมาลี สวยงาม",
        phoneNumber: "082-345-6789",
        areaSize: 3,
        cropType: "ทุเรียน",
        sprayType: "ฮอร์โมน",
        totalPrice: 750,
        depositAmount: 225,
        status: "pending_payment",
        scheduledDate: "2024-01-21",
        scheduledTime: "09:00",
        gpsCoordinates: "13.8563, 100.6018",
        notes: "",
        assignedDrone: "",
        assignedPilot: "",
        createdAt: "2024-01-18T14:15:00Z",
      },
      {
        id: "3",
        customerName: "นายประยุทธ์ เก่งมาก",
        phoneNumber: "083-456-7890",
        areaSize: 8,
        cropType: "อ้อย",
        sprayType: "ยาฆ่าหญ้า",
        totalPrice: 2160,
        depositAmount: 648,
        status: "assigned",
        scheduledDate: "2024-01-22",
        scheduledTime: "07:00",
        gpsCoordinates: "13.9563, 100.7018",
        notes: "พื้นที่มีความลาดชัน",
        assignedDrone: "โดรน #2",
        assignedPilot: "นายวิชัย",
        createdAt: "2024-01-19T09:20:00Z",
      },
    ]
    setOrders(mockOrders)
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.phoneNumber.includes(searchTerm) ||
          order.id.includes(searchTerm),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_payment: { label: "รอชำระ", variant: "destructive" as const },
      paid: { label: "ชำระแล้ว", variant: "default" as const },
      assigned: { label: "จัดโดรน", variant: "secondary" as const },
      completed: { label: "เสร็จสิ้น", variant: "default" as const },
      cancelled: { label: "ยกเลิก", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus as any } : order)))
  }

  const exportOrders = () => {
    // Implementation for exporting orders to PDF/Excel
    alert("ฟีเจอร์ Export จะพัฒนาในเวอร์ชันถัดไป")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการออร์เดอร์</h1>
            <p className="text-gray-600">จัดการและติดตามออร์เดอร์ทั้งหมด</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportOrders} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/admin">
              <Button variant="outline">กลับหน้าหลัก</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ค้นหาและกรอง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ค้นหาด้วยชื่อ, เบอร์โทร, หรือรหัสออร์เดอร์"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="กรองตามสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="pending_payment">รอชำระ</SelectItem>
                  <SelectItem value="paid">ชำระแล้ว</SelectItem>
                  <SelectItem value="assigned">จัดโดรน</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  <SelectItem value="cancelled">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการออร์เดอร์ ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>พืช/สาร</TableHead>
                  <TableHead>พื้นที่</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.phoneNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{order.cropType}</p>
                        <p className="text-sm text-gray-600">{order.sprayType}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.areaSize} ไร่</TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(order.scheduledDate).toLocaleDateString("th-TH")}</p>
                        <p className="text-sm text-gray-600">{order.scheduledTime} น.</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">฿{order.totalPrice.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">มัดจำ: ฿{order.depositAmount.toLocaleString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>รายละเอียดออร์เดอร์ #{selectedOrder?.id}</DialogTitle>
                              <DialogDescription>ข้อมูลครบถ้วนของออร์เดอร์</DialogDescription>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>ชื่อลูกค้า</Label>
                                    <p className="font-medium">{selectedOrder.customerName}</p>
                                  </div>
                                  <div>
                                    <Label>เบอร์โทรศัพท์</Label>
                                    <p className="font-medium">{selectedOrder.phoneNumber}</p>
                                  </div>
                                  <div>
                                    <Label>ชนิดพืช</Label>
                                    <p className="font-medium">{selectedOrder.cropType}</p>
                                  </div>
                                  <div>
                                    <Label>ชนิดสารพ่น</Label>
                                    <p className="font-medium">{selectedOrder.sprayType}</p>
                                  </div>
                                  <div>
                                    <Label>พื้นที่</Label>
                                    <p className="font-medium">{selectedOrder.areaSize} ไร่</p>
                                  </div>
                                  <div>
                                    <Label>พิกัด GPS</Label>
                                    <p className="font-medium">{selectedOrder.gpsCoordinates}</p>
                                  </div>
                                  <div>
                                    <Label>วันที่นัดหมาย</Label>
                                    <p className="font-medium">
                                      {new Date(selectedOrder.scheduledDate).toLocaleDateString("th-TH")}{" "}
                                      {selectedOrder.scheduledTime} น.
                                    </p>
                                  </div>
                                  <div>
                                    <Label>สถานะ</Label>
                                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                                  </div>
                                </div>

                                <div>
                                  <Label>หมายเหตุ</Label>
                                  <p className="font-medium">{selectedOrder.notes || "ไม่มี"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>โดรนที่จัด</Label>
                                    <p className="font-medium">{selectedOrder.assignedDrone || "ยังไม่จัด"}</p>
                                  </div>
                                  <div>
                                    <Label>นักบิน</Label>
                                    <p className="font-medium">{selectedOrder.assignedPilot || "ยังไม่จัด"}</p>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>ราคารวม</Label>
                                      <p className="text-lg font-bold">฿{selectedOrder.totalPrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <Label>ยอดมัดจำ</Label>
                                      <p className="text-lg font-bold text-green-600">
                                        ฿{selectedOrder.depositAmount.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Select
                                    value={selectedOrder.status}
                                    onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                                  >
                                    <SelectTrigger className="flex-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending_payment">รอชำระ</SelectItem>
                                      <SelectItem value="paid">ชำระแล้ว</SelectItem>
                                      <SelectItem value="assigned">จัดโดรน</SelectItem>
                                      <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                                      <SelectItem value="cancelled">ยกเลิก</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button>บันทึกการเปลี่ยนแปลง</Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
