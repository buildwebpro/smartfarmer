'use client'
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Wheat, Plus, Edit, Trash2, RefreshCw, Banknote, Sprout, Droplets } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface CropType {
  id: string
  name: string
  pricePerRai: number
}

interface SprayType {
  id: string
  name: string
  pricePerRai: number
  description?: string
}

export default function AdminCropTypesPage() {
  const [cropTypes, setCropTypes] = useState<CropType[]>([])
  const [sprayTypes, setSprayTypes] = useState<SprayType[]>([])
  const [loading, setLoading] = useState(true)
  
  // Crop states
  const [editingCrop, setEditingCrop] = useState<CropType | null>(null)
  const [newCrop, setNewCrop] = useState({ name: "", pricePerRai: 0 })
  const [isAddCropDialogOpen, setIsAddCropDialogOpen] = useState(false)
  const [editingCropId, setEditingCropId] = useState<string | null>(null)
  
  // Spray states
  const [editingSpray, setEditingSpray] = useState<SprayType | null>(null)
  const [newSpray, setNewSpray] = useState({ name: "", pricePerRai: 0, description: "" })
  const [isAddSprayDialogOpen, setIsAddSprayDialogOpen] = useState(false)
  const [editingSprayId, setEditingSprayId] = useState<string | null>(null)

  const fetchCropTypes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/crop-types")
      const { data } = await res.json()
      setCropTypes(data || [])
    } catch (error) {
      console.error("Error fetching crop types:", error)
      setCropTypes([])
    }
    setLoading(false)
  }

  const fetchSprayTypes = async () => {
    try {
      const res = await fetch("/api/spray-types")
      const { data } = await res.json()
      setSprayTypes(data || [])
    } catch (error) {
      console.error("Error fetching spray types:", error)
      setSprayTypes([])
    }
  }

  useEffect(() => { 
    fetchCropTypes()
    fetchSprayTypes()
  }, [])

  // Crop functions
  const handleAddCrop = async () => {
    if (!newCrop.name || !newCrop.pricePerRai) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }
    try {
      const response = await fetch("/api/crop-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCrop),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      setNewCrop({ name: "", pricePerRai: 0 })
      setIsAddCropDialogOpen(false)
      fetchCropTypes()
      alert("เพิ่มชนิดพืชสำเร็จ")
    } catch (error) {
      console.error("Error adding crop:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถเพิ่มข้อมูลได้"}`)
    }
  }

  const handleEditCrop = (crop: CropType) => {
    setEditingCrop(crop)
    setEditingCropId(crop.id)
  }

  const handleUpdateCrop = async () => {
    if (!editingCrop) return
    try {
      const response = await fetch("/api/crop-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCrop),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      setEditingCrop(null)
      setEditingCropId(null)
      fetchCropTypes()
      alert("อัพเดตข้อมูลสำเร็จ")
    } catch (error) {
      console.error("Error updating crop:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถอัพเดตข้อมูลได้"}`)
    }
  }

  const handleCancelEditCrop = () => {
    setEditingCrop(null)
    setEditingCropId(null)
  }

  const handleDeleteCrop = async (id: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบชนิดพืชนี้?")) return
    
    try {
      const response = await fetch("/api/crop-types", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      fetchCropTypes()
      alert("ลบข้อมูลสำเร็จ")
    } catch (error) {
      console.error("Error deleting crop:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้"}`)
    }
  }

  // Spray functions
  const handleAddSpray = async () => {
    if (!newSpray.name || !newSpray.pricePerRai) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }
    try {
      const response = await fetch("/api/spray-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSpray),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      setNewSpray({ name: "", pricePerRai: 0, description: "" })
      setIsAddSprayDialogOpen(false)
      fetchSprayTypes()
      alert("เพิ่มยาพ่นสำเร็จ")
    } catch (error) {
      console.error("Error adding spray:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถเพิ่มข้อมูลได้"}`)
    }
  }

  const handleEditSpray = (spray: SprayType) => {
    setEditingSpray(spray)
    setEditingSprayId(spray.id)
  }

  const handleUpdateSpray = async () => {
    if (!editingSpray) return
    try {
      const response = await fetch("/api/spray-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSpray),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      setEditingSpray(null)
      setEditingSprayId(null)
      fetchSprayTypes()
      alert("อัพเดตข้อมูลสำเร็จ")
    } catch (error) {
      console.error("Error updating spray:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถอัพเดตข้อมูลได้"}`)
    }
  }

  const handleCancelEditSpray = () => {
    setEditingSpray(null)
    setEditingSprayId(null)
  }

  const handleDeleteSpray = async (id: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบยาพ่นนี้?")) return
    
    try {
      const response = await fetch("/api/spray-types", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      fetchSprayTypes()
      alert("ลบข้อมูลสำเร็จ")
    } catch (error) {
      console.error("Error deleting spray:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้"}`)
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              จัดการพืชและยาพ่น
            </h1>
          <p className="text-gray-600 mt-1">กำหนดชนิดพืช ยาพ่น และราคาบริการ</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              fetchCropTypes()
              fetchSprayTypes()
            }}
            variant="outline"
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">ยาพ่นทั้งหมด</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sprayTypes.length}</div>
            <p className="text-xs text-gray-500">ชนิดในระบบ</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ราคาต่ำสุด</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Banknote className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...cropTypes, ...sprayTypes].length > 0 ? 
                Math.min(...[...cropTypes, ...sprayTypes].map(c => c.pricePerRai || 0)).toLocaleString() : 0}
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
              {[...cropTypes, ...sprayTypes].length > 0 ? 
                Math.max(...[...cropTypes, ...sprayTypes].map(c => c.pricePerRai || 0)).toLocaleString() : 0}
            </div>
            <p className="text-xs text-gray-500">บาท/ไร่</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Crops and Sprays */}
      <Tabs defaultValue="crops" className="w-full mt-8 my-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crops" className="flex items-center gap-2">
            <Wheat className="h-4 w-4" />
            จัดการพืช
          </TabsTrigger>
          <TabsTrigger value="sprays" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            จัดการยาพ่น
          </TabsTrigger>
        </TabsList>

        {/* Crops Tab */}
        <TabsContent value="crops" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddCropDialogOpen} onOpenChange={setIsAddCropDialogOpen}>
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
                    <Label htmlFor="cropPrice">ราคาต่อไร่ (บาท)</Label>
                    <Input
                      id="cropPrice"
                      type="number"
                      placeholder="0"
                      value={newCrop.pricePerRai}
                      onChange={(e) => setNewCrop({ ...newCrop, pricePerRai: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsAddCropDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                    <Button onClick={handleAddCrop} className="bg-emerald-600 hover:bg-emerald-700">
                      เพิ่ม
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

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
                            {editingCropId === crop.id ? (
                              <Input
                                value={editingCrop?.name ?? ""}
                                onChange={(e) => setEditingCrop({ ...editingCrop!, name: e.target.value })}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <Wheat className="h-4 w-4 text-emerald-600" />
                                <span className="font-medium">{crop.name}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingCropId === crop.id ? (
                              <Input
                                type="number"
                                value={editingCrop?.pricePerRai ?? 0}
                                onChange={(e) => setEditingCrop({ ...editingCrop!, pricePerRai: Number(e.target.value) })}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-700">{(crop.pricePerRai || 0).toLocaleString()} บาท</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              {editingCropId === crop.id ? (
                                <>
                                  <Button size="sm" onClick={handleUpdateCrop} className="bg-emerald-600 hover:bg-emerald-700">
                                    บันทึก
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEditCrop}>
                                    ยกเลิก
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleEditCrop(crop)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteCrop(crop.id)}>
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
        </TabsContent>
    

        {/* Sprays Tab */}
        <TabsContent value="sprays" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddSprayDialogOpen} onOpenChange={setIsAddSprayDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มยาพ่น
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มยาพ่นใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sprayName">ชื่อยาพ่น</Label>
                    <Input
                      id="sprayName"
                      placeholder="เช่น ยาฆ่าแมลง, ยาฆ่าหญ้า"
                      value={newSpray.name}
                      onChange={(e) => setNewSpray({ ...newSpray, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sprayPrice">ราคาต่อไร่ (บาท)</Label>
                    <Input
                      id="sprayPrice"
                      type="number"
                      placeholder="0"
                      value={newSpray.pricePerRai}
                      onChange={(e) => setNewSpray({ ...newSpray, pricePerRai: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sprayDescription">คำอธิบาย (ไม่บังคับ)</Label>
                    <Textarea
                      id="sprayDescription"
                      placeholder="รายละเอียดของยาพ่น..."
                      value={newSpray.description}
                      onChange={(e) => setNewSpray({ ...newSpray, description: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsAddSprayDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                    <Button onClick={handleAddSpray} className="bg-blue-600 hover:bg-blue-700">
                      เพิ่ม
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">รายการยาพ่น</CardTitle>
              <CardDescription>จัดการข้อมูลยาพ่นและราคาบริการ</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead>ชื่อยาพ่น</TableHead>
                    <TableHead>ราคาต่อไร่</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                    <TableHead className="text-center">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sprayTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Droplets className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-400">ไม่พบข้อมูลยาพ่น</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sprayTypes.map((spray, index) => (
                      <TableRow key={spray.id}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell>
                          {editingSprayId === spray.id ? (
                            <Input
                              value={editingSpray?.name ?? ""}
                              onChange={(e) => setEditingSpray({ ...editingSpray!, name: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{spray.name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingSprayId === spray.id ? (
                            <Input
                              type="number"
                              value={editingSpray?.pricePerRai ?? 0}
                              onChange={(e) => setEditingSpray({ ...editingSpray!, pricePerRai: Number(e.target.value) })}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-700">{(spray.pricePerRai || 0).toLocaleString()} บาท</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingSprayId === spray.id ? (
                            <Textarea
                              value={editingSpray?.description ?? ""}
                              onChange={(e) => setEditingSpray({ ...editingSpray!, description: e.target.value })}
                            />
                          ) : (
                            <span className="text-sm text-gray-600">{spray.description || "-"}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            {editingSprayId === spray.id ? (
                              <>
                                <Button size="sm" onClick={handleUpdateSpray} className="bg-blue-600 hover:bg-blue-700">
                                  บันทึก
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEditSpray}>
                                  ยกเลิก
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleEditSpray(spray)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteSpray(spray.id)}>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ProtectedRoute>
  )
}