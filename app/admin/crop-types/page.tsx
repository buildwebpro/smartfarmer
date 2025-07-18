"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Wheat, Plus, Edit, Trash2, RefreshCw, Banknote, Sprout } from "lucide-react"

interface CropType {
  id: string
  name: string
  pricePerRai: number
}

export default function AdminCropTypesPage() {
  const [cropTypes, setCropTypes] = useState<CropType[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<CropType | null>(null)
  const [newCrop, setNewCrop] = useState({ name: "", pricePerRai: 0 })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchCropTypes = async () => {
    setLoading(true)
    const res = await fetch("/api/crop-types")
    const { data } = await res.json()
    setCropTypes(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCropTypes() }, [])

  const handleAdd = async () => {
    if (!newCrop.name || !newCrop.pricePerRai) return
    await fetch("/api/crop-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCrop),
    })
    setNewCrop({ name: "", pricePerRai: 0 })
    setIsAddDialogOpen(false)
    fetchCropTypes()
  }

  const handleEdit = (crop: CropType) => {
    setEditing(crop)
    setEditingId(crop.id)
  }

  const handleUpdate = async () => {
    if (!editing) return
    await fetch("/api/crop-types", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    })
    setEditing(null)
    setEditingId(null)
    fetchCropTypes()
  }

  const handleCancelEdit = () => {
    setEditing(null)
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    await fetch("/api/crop-types", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchCropTypes()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            จัดการชนิดพืช
          </h1>
          <p className="text-gray-600 mt-2">กำหนดชนิดพืชและราคาบริการ</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => fetchCropTypes()} 
            variant="outline"
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มชนิดพืช
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มชนิดพืชใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cropName">ชื่อพืช</Label>
                  <Input
                    id="cropName"
                    placeholder="เช่น ข้าว, ทุเรียน, มะม่วง"
                    value={newCrop.name}
                    onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerRai">ราคาต่อไร่ (บาท)</Label>
                  <Input
                    id="pricePerRai"
                    type="number"
                    placeholder="0"
                    value={newCrop.pricePerRai}
                    onChange={(e) => setNewCrop({ ...newCrop, pricePerRai: Number(e.target.value) })}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
                    เพิ่ม
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ชนิดพืชทั้งหมด</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Wheat className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cropTypes.length}</div>
            <p className="text-xs text-gray-500">ชนิดในระบบ</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ราคาต่ำสุด</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Banknote className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cropTypes.length > 0 ? Math.min(...cropTypes.map(c => c.pricePerRai)).toLocaleString() : 0}
            </div>
            <p className="text-xs text-gray-500">บาท/ไร่</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ราคาสูงสุด</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sprout className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cropTypes.length > 0 ? Math.max(...cropTypes.map(c => c.pricePerRai)).toLocaleString() : 0}
            </div>
            <p className="text-xs text-gray-500">บาท/ไร่</p>
          </CardContent>
        </Card>
      </div>

      {/* Crop Types Table */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">รายการชนิดพืช</CardTitle>
          <CardDescription>จัดการข้อมูลชนิดพืชและราคาบริการ</CardDescription>
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
                  <TableHead>ชื่อพืช</TableHead>
                  <TableHead>ราคาต่อไร่</TableHead>
                  <TableHead className="text-center">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cropTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Wheat className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-400">ไม่พบข้อมูลชนิดพืช</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cropTypes.map((crop, index) => (
                    <TableRow key={crop.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {editingId === crop.id ? (
                          <Input
                            value={editing?.name ?? ""}
                            onChange={(e) => setEditing({ ...editing!, name: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Wheat className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">{crop.name}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === crop.id ? (
                          <Input
                            type="number"
                            value={editing?.pricePerRai ?? 0}
                            onChange={(e) => setEditing({ ...editing!, pricePerRai: Number(e.target.value) })}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-700">{crop.pricePerRai.toLocaleString()} บาท</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {editingId === crop.id ? (
                            <>
                              <Button size="sm" onClick={handleUpdate} className="bg-emerald-600 hover:bg-emerald-700">
                                บันทึก
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                ยกเลิก
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(crop)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(crop.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
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
  )
} 