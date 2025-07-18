'use client'
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, Plus, Edit, Trash2, RefreshCw, Award, Phone, MapPin, Clock, User, UserX } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface Pilot {
  id: string
  name: string
  phone: string
  experience_years: number
  certifications: string[]
  is_active: boolean
  created_at: string
  total_flights?: number
  rating?: number
}

export default function AdminPilotsPage() {
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pilot states
  const [editingPilot, setEditingPilot] = useState<Pilot | null>(null)
  const [newPilot, setNewPilot] = useState({ 
    name: "", 
    phone: "", 
    experience_years: 0,
    certifications: [] as string[],
    is_active: true 
  })
  const [isAddPilotDialogOpen, setIsAddPilotDialogOpen] = useState(false)
  const [editingPilotId, setEditingPilotId] = useState<string | null>(null)
  const [newCertification, setNewCertification] = useState("")

  const fetchPilots = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/pilots")
      if (!res.ok) {
        throw new Error("Failed to fetch pilots")
      }
      const { data } = await res.json()
      setPilots(data || [])
    } catch (error) {
      console.error("Error fetching pilots:", error)
      setPilots([])
    }
    setLoading(false)
  }

  useEffect(() => { 
    fetchPilots()
  }, [])

  const handleAddPilot = async () => {
    if (!newPilot.name || !newPilot.phone) {
      alert("กรุณากรอกชื่อและเบอร์โทรให้ครบถ้วน")
      return
    }
    try {
      const response = await fetch("/api/pilots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPilot),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      setNewPilot({ name: "", phone: "", experience_years: 0, certifications: [], is_active: true })
      setIsAddPilotDialogOpen(false)
      fetchPilots()
      alert("เพิ่มนักบินสำเร็จ")
    } catch (error) {
      console.error("Error adding pilot:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถเพิ่มข้อมูลได้"}`)
    }
  }

  const handleEditPilot = (pilot: Pilot) => {
    setEditingPilot(pilot)
    setEditingPilotId(pilot.id)
  }

  const handleUpdatePilot = async () => {
    if (!editingPilot) return
    try {
      const response = await fetch("/api/pilots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPilot),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      setEditingPilot(null)
      setEditingPilotId(null)
      fetchPilots()
      alert("อัพเดตข้อมูลสำเร็จ")
    } catch (error) {
      console.error("Error updating pilot:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถอัพเดตข้อมูลได้"}`)
    }
  }

  const handleCancelEditPilot = () => {
    setEditingPilot(null)
    setEditingPilotId(null)
  }

  const handleDeletePilot = async (id: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบนักบินนี้?")) return
    
    try {
      const response = await fetch("/api/pilots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      fetchPilots()
      alert("ลบข้อมูลสำเร็จ")
    } catch (error) {
      console.error("Error deleting pilot:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้"}`)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge variant="default" className="bg-green-600"><UserCheck className="h-3 w-3 mr-1" />ปฏิบัติงาน</Badge>
    }
    return <Badge variant="destructive"><UserX className="h-3 w-3 mr-1" />ไม่ปฏิบัติงาน</Badge>
  }

  const getExperienceBadge = (years: number) => {
    if (years >= 5) {
      return <Badge variant="default" className="bg-purple-600"><Award className="h-3 w-3 mr-1" />ผู้เชี่ยวชาญ</Badge>
    } else if (years >= 2) {
      return <Badge variant="secondary" className="bg-blue-600 text-white"><Award className="h-3 w-3 mr-1" />มีประสบการณ์</Badge>
    } else {
      return <Badge variant="outline"><Award className="h-3 w-3 mr-1" />มือใหม่</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setNewPilot({
        ...newPilot,
        certifications: [...newPilot.certifications, newCertification.trim()]
      })
      setNewCertification("")
    }
  }

  const removeCertification = (index: number) => {
    setNewPilot({
      ...newPilot,
      certifications: newPilot.certifications.filter((_, i) => i !== index)
    })
  }

  const addEditingCertification = () => {
    if (editingPilot && newCertification.trim()) {
      setEditingPilot({
        ...editingPilot,
        certifications: [...editingPilot.certifications, newCertification.trim()]
      })
      setNewCertification("")
    }
  }

  const removeEditingCertification = (index: number) => {
    if (editingPilot) {
      setEditingPilot({
        ...editingPilot,
        certifications: editingPilot.certifications.filter((_, i) => i !== index)
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              จัดการนักบินโดรน
            </h1>
            <p className="text-gray-600 mt-1">จัดการข้อมูลนักบินและใบอนุญาต</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchPilots}
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
              <CardTitle className="text-sm font-medium">นักบินทั้งหมด</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pilots.length}</div>
              <p className="text-xs text-gray-500">คนในระบบ</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักบินปฏิบัติงาน</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pilots.filter(p => p.is_active).length}</div>
              <p className="text-xs text-gray-500">พร้อมบิน</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักบินมือใหม่</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pilots.filter(p => p.experience_years < 2).length}</div>
              <p className="text-xs text-gray-500">ประสบการณ์น้อยกว่า 2 ปี</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักบินผู้เชี่ยวชาญ</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pilots.filter(p => p.experience_years >= 5).length}</div>
              <p className="text-xs text-gray-500">ประสบการณ์ 5 ปีขึ้นไป</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Pilot Button */}
        <div className="flex justify-end">
          <Dialog open={isAddPilotDialogOpen} onOpenChange={setIsAddPilotDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มนักบินใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>เพิ่มนักบินใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pilotName">ชื่อ-นามสกุล</Label>
                    <Input
                      id="pilotName"
                      placeholder="ชื่อ นามสกุล"
                      value={newPilot.name}
                      onChange={(e) => setNewPilot({ ...newPilot, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pilotPhone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="pilotPhone"
                      placeholder="0xx-xxx-xxxx"
                      value={newPilot.phone}
                      onChange={(e) => setNewPilot({ ...newPilot, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pilotExperience">ประสบการณ์ (ปี)</Label>
                  <Input
                    id="pilotExperience"
                    type="number"
                    placeholder="0"
                    value={newPilot.experience_years}
                    onChange={(e) => setNewPilot({ ...newPilot, experience_years: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>ใบอนุญาต/ใบรับรอง</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="เพิ่มใบอนุญาต"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                    />
                    <Button onClick={addCertification} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newPilot.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeCertification(index)}>
                        {cert} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pilotActive"
                    checked={newPilot.is_active}
                    onCheckedChange={(checked) => setNewPilot({ ...newPilot, is_active: checked })}
                  />
                  <Label htmlFor="pilotActive">พร้อมปฏิบัติงาน</Label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddPilotDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleAddPilot} className="bg-blue-600 hover:bg-blue-700">
                    เพิ่ม
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pilots Table */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">รายการนักบินโดรน</CardTitle>
            <CardDescription>จัดการข้อมูลนักบินและใบอนุญาต</CardDescription>
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
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>เบอร์โทร</TableHead>
                    <TableHead>ประสบการณ์</TableHead>
                    <TableHead>ใบอนุญาต</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>วันที่เพิ่ม</TableHead>
                    <TableHead className="text-center">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pilots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <User className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-400">ไม่พบข้อมูลนักบิน</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pilots.map((pilot, index) => (
                      <TableRow key={pilot.id}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell>
                          {editingPilotId === pilot.id ? (
                            <Input
                              value={editingPilot?.name ?? ""}
                              onChange={(e) => setEditingPilot({ ...editingPilot!, name: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{pilot.name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingPilotId === pilot.id ? (
                            <Input
                              value={editingPilot?.phone ?? ""}
                              onChange={(e) => setEditingPilot({ ...editingPilot!, phone: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span>{pilot.phone}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingPilotId === pilot.id ? (
                            <Input
                              type="number"
                              value={editingPilot?.experience_years ?? 0}
                              onChange={(e) => setEditingPilot({ ...editingPilot!, experience_years: Number(e.target.value) })}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-600" />
                              <span>{pilot.experience_years} ปี</span>
                              {getExperienceBadge(pilot.experience_years)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {pilot.certifications.length > 0 ? (
                              pilot.certifications.map((cert, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {cert}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingPilotId === pilot.id ? (
                            <Switch
                              checked={editingPilot?.is_active ?? false}
                              onCheckedChange={(checked) => setEditingPilot({ ...editingPilot!, is_active: checked })}
                            />
                          ) : (
                            getStatusBadge(pilot.is_active)
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{formatDate(pilot.created_at)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            {editingPilotId === pilot.id ? (
                              <>
                                <Button size="sm" onClick={handleUpdatePilot} className="bg-blue-600 hover:bg-blue-700">
                                  บันทึก
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEditPilot}>
                                  ยกเลิก
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleEditPilot(pilot)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeletePilot(pilot.id)}>
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
    </ProtectedRoute>
  )
}
