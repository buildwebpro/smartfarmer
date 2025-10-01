"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  description?: string
  icon: string
  is_active: boolean
  display_order: number
  created_at?: string
}

export default function EquipmentCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/equipment/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('ไม่สามารถโหลดข้อมูลประเภทเครื่องจักรได้')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({
      name: "",
      description: "",
      icon: "Package",
      display_order: categories.length + 1,
      is_active: true,
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon,
      display_order: category.display_order,
      is_active: category.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/equipment/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('เพิ่มประเภทเครื่องจักรสำเร็จ')
        setIsAddDialogOpen(false)
        fetchCategories()
      } else {
        toast.error('ไม่สามารถเพิ่มประเภทเครื่องจักรได้')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory) return

    try {
      const response = await fetch('/api/equipment/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCategory.id,
          ...formData,
        }),
      })

      if (response.ok) {
        toast.success('แก้ไขประเภทเครื่องจักรสำเร็จ')
        setIsEditDialogOpen(false)
        fetchCategories()
      } else {
        toast.error('ไม่สามารถแก้ไขประเภทเครื่องจักรได้')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบประเภทนี้หรือไม่?')) return

    try {
      const response = await fetch(`/api/equipment/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('ลบประเภทสำเร็จ')
        fetchCategories()
      } else {
        toast.error('ไม่สามารถลบประเภทได้')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const iconSuggestions = [
    "Package", "Truck", "Tractor", "Plane", "Wheat", "Droplets",
    "Sprout", "Scissors", "Wrench", "Settings", "Zap", "Tool"
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการประเภทเครื่องจักร</h1>
          <p className="text-gray-600 mt-1">เพิ่ม แก้ไข และจัดการประเภทของเครื่องจักร</p>
        </div>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มประเภทใหม่
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">ประเภททั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">ใช้งานอยู่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {categories.filter(c => c.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">ปิดใช้งาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">
              {categories.filter(c => !c.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการประเภทเครื่องจักร</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>ยังไม่มีประเภทเครื่องจักร</p>
              <Button onClick={handleAdd} variant="outline" className="mt-4">
                เพิ่มประเภทแรก
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลำดับ</TableHead>
                  <TableHead>ไอคอน</TableHead>
                  <TableHead>ชื่อประเภท</TableHead>
                  <TableHead>คำอธิบาย</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.display_order}</TableCell>
                      <TableCell>
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>เพิ่มประเภทเครื่องจักร</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd} className="space-y-4">
            <div>
              <Label>ชื่อประเภท *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น รถไถ, รถเกี่ยวข้าว"
                required
              />
            </div>

            <div>
              <Label>คำอธิบาย</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายเกี่ยวกับประเภทนี้"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ไอคอน (Lucide Icon Name)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="เช่น Truck, Package"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {iconSuggestions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>ลำดับการแสดง</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">ใช้งาน</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                เพิ่มประเภท
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขประเภทเครื่องจักร</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <Label>ชื่อประเภท *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น รถไถ, รถเกี่ยวข้าว"
                required
              />
            </div>

            <div>
              <Label>คำอธิบาย</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายเกี่ยวกับประเภทนี้"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ไอคอน (Lucide Icon Name)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="เช่น Truck, Package"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {iconSuggestions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>ลำดับการแสดง</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_edit"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active_edit" className="cursor-pointer">ใช้งาน</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                บันทึก
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
