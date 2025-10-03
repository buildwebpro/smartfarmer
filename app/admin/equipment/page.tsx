"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react"
import { toast } from "sonner"

interface Equipment {
  id: string
  category_id: string
  name: string
  model: string
  brand?: string
  description?: string
  status: 'available' | 'working' | 'maintenance' | 'repair' | 'retired'
  rental_price_per_day: number
  rental_price_per_hour?: number
  deposit_amount: number
  current_location?: string
  image_url?: string
  category?: {
    id: string
    name: string
    icon: string
  }
  operator?: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  icon: string
  description?: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCategories()
    fetchEquipment()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/equipment/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('ไม่สามารถโหลดประเภทเครื่องจักรได้')
    }
  }

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/equipment')
      const result = await response.json()
      if (result.success) {
        setEquipment(result.data)
      }
    } catch (error) {
      console.error('Error fetching equipment:', error)
      toast.error('ไม่สามารถโหลดข้อมูลเครื่องจักรได้')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบเครื่องจักรนี้หรือไม่?')) return

    try {
      const response = await fetch(`/api/equipment?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('ลบเครื่องจักรสำเร็จ')
        fetchEquipment()
      } else {
        toast.error('ไม่สามารถลบเครื่องจักรได้')
      }
    } catch (error) {
      console.error('Error deleting equipment:', error)
      toast.error('เกิดข้อผิดพลาดในการลบเครื่องจักร')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: 'พร้อมใช้งาน', variant: 'default' as const },
      working: { label: 'กำลังใช้งาน', variant: 'secondary' as const },
      maintenance: { label: 'บำรุงรักษา', variant: 'outline' as const },
      repair: { label: 'ซ่อมแซม', variant: 'destructive' as const },
      retired: { label: 'ปลดประจำการ', variant: 'outline' as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredEquipment = equipment.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    working: equipment.filter(e => e.status === 'working').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการเครื่องจักร</h1>
          <p className="text-gray-600 mt-2">จัดการเครื่องจักรและอุปกรณ์ให้เช่า</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มเครื่องจักร
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">พร้อมใช้งาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">กำลังใช้งาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.working}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">บำรุงรักษา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาเครื่องจักร..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="ประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-8 text-gray-500">ไม่พบเครื่องจักร</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>รุ่น</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ค่าเช่า/วัน</TableHead>
                  <TableHead>มัดจำ</TableHead>
                  <TableHead>สถานที่</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category?.name}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>฿{item.rental_price_per_day.toLocaleString()}</TableCell>
                    <TableCell>฿{item.deposit_amount.toLocaleString()}</TableCell>
                    <TableCell>{item.current_location || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEquipment(item)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <EquipmentFormDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        categories={categories}
        onSuccess={() => {
          fetchEquipment()
          setIsAddDialogOpen(false)
        }}
      />

      {/* Edit Dialog */}
      {selectedEquipment && (
        <EquipmentFormDialog
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedEquipment(null)
          }}
          categories={categories}
          equipment={selectedEquipment}
          onSuccess={() => {
            fetchEquipment()
            setIsEditDialogOpen(false)
            setSelectedEquipment(null)
          }}
        />
      )}
    </div>
  )
}

interface EquipmentFormDialogProps {
  open: boolean
  onClose: () => void
  categories: Category[]
  equipment?: Equipment
  onSuccess: () => void
}

function EquipmentFormDialog({ open, onClose, categories, equipment, onSuccess }: EquipmentFormDialogProps) {
  const [formData, setFormData] = useState({
    category_id: equipment?.category_id || '',
    name: equipment?.name || '',
    model: equipment?.model || '',
    brand: equipment?.brand || '',
    description: equipment?.description || '',
    status: equipment?.status || 'available',
    rental_price_per_day: equipment?.rental_price_per_day || 0,
    rental_price_per_hour: equipment?.rental_price_per_hour || 0,
    deposit_amount: equipment?.deposit_amount || 0,
    current_location: equipment?.current_location || '',
  })

  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.category_id) {
      toast.error('กรุณาเลือกประเภทเครื่องจักร')
      return
    }
    if (!formData.name) {
      toast.error('กรุณากรอกชื่อเครื่องจักร')
      return
    }
    if (!formData.model) {
      toast.error('กรุณากรอกรุ่นเครื่องจักร')
      return
    }
    if (!formData.rental_price_per_day || formData.rental_price_per_day <= 0) {
      toast.error('กรุณากรอกค่าเช่าต่อวันที่ถูกต้อง')
      return
    }
    if (!formData.deposit_amount || formData.deposit_amount <= 0) {
      toast.error('กรุณากรอกจำนวนเงินมัดจำที่ถูกต้อง')
      return
    }

    setSaving(true)

    try {
      const url = '/api/equipment'
      const method = equipment ? 'PUT' : 'POST'
      const body = equipment ? { id: equipment.id, ...formData } : formData

      console.log('Sending request:', { method, url, body })

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()
      console.log('Response:', { status: response.status, result })

      if (response.ok) {
        toast.success(equipment ? 'อัปเดตเครื่องจักรสำเร็จ' : 'เพิ่มเครื่องจักรสำเร็จ')
        onSuccess()
      } else {
        const errorMsg = result.error || 'เกิดข้อผิดพลาด'
        toast.error(errorMsg)
        console.error('Server error:', result)
      }
    } catch (error) {
      console.error('Error saving equipment:', error)
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{equipment ? 'แก้ไขเครื่องจักร' : 'เพิ่มเครื่องจักรใหม่'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ประเภท *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">พร้อมใช้งาน</SelectItem>
                  <SelectItem value="working">กำลังใช้งาน</SelectItem>
                  <SelectItem value="maintenance">บำรุงรักษา</SelectItem>
                  <SelectItem value="repair">ซ่อมแซม</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ชื่อ *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>รุ่น *</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ยี่ห้อ</Label>
            <Input
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>รายละเอียด</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>ค่าเช่า/วัน (บาท) *</Label>
              <Input
                type="number"
                value={formData.rental_price_per_day}
                onChange={(e) => setFormData({ ...formData, rental_price_per_day: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>ค่าเช่า/ชั่วโมง (บาท)</Label>
              <Input
                type="number"
                value={formData.rental_price_per_hour}
                onChange={(e) => setFormData({ ...formData, rental_price_per_hour: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>มัดจำ (บาท) *</Label>
              <Input
                type="number"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>สถานที่</Label>
            <Input
              value={formData.current_location}
              onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
              placeholder="เช่น ฐานหลัก, คลังเก็บ"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
