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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { Plus, Search, Trash2, Edit, MapPin, Phone, Mail, Calendar, Star, AlertTriangle, Trophy, Clock, Shield, Users, Gauge, RefreshCw, User, UserCheck, Award } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface Pilot {
  id: string
  name: string
  phone: string
  email?: string
  line_id?: string
  address?: string
  birth_date?: string
  gender?: string
  
  // เอกสาร/ใบอนุญาต
  national_id?: string
  uas_license_no?: string
  uas_license_expiry?: string
  
  // ประสบการณ์
  experience_years: number
  total_flight_hours?: number
  agricultural_hours?: number
  projects_completed?: number
  
  // สถานะและความพร้อม
  status?: 'available' | 'on_leave' | 'training' | 'suspended' | 'busy'
  
  // ความปลอดภัย
  health_status?: string
  safety_score?: number
  
  // การประเมิน
  average_rating?: number
  total_reviews?: number
  
  // ระบบ
  certifications: string[]
  is_active: boolean
  created_at: string
}

export default function AdminPilotsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pilot states
  const [editingPilot, setEditingPilot] = useState<Pilot | null>(null)
  const [newPilot, setNewPilot] = useState({ 
    name: "", 
    phone: "", 
    email: "",
    line_id: "",
    address: "",
    birth_date: "",
    gender: "",
    national_id: "",
    uas_license_no: "",
    uas_license_expiry: "",
    experience_years: 0,
    total_flight_hours: 0,
    agricultural_hours: 0,
    projects_completed: 0,
    status: "available" as const,
    health_status: "",
    safety_score: 100,
    certifications: [] as string[],
    is_active: true 
  })
  const [isAddPilotDialogOpen, setIsAddPilotDialogOpen] = useState(false)
  const [editingPilotId, setEditingPilotId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    licenseNumber: '',
    licenseExpiry: '',
    totalFlightHours: 0,
    droneSprayingHours: 0,
    certifications: '',
    specializations: '',
    emergencyContact: '',
    emergencyPhone: '',
    healthStatus: '',
    lastMedicalCheck: '',
    notes: ''
  })
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
      
      // Reset form
      setNewPilot({ 
        name: "", 
        phone: "", 
        email: "",
        line_id: "",
        address: "",
        birth_date: "",
        gender: "",
        national_id: "",
        uas_license_no: "",
        uas_license_expiry: "",
        experience_years: 0,
        total_flight_hours: 0,
        agricultural_hours: 0,
        projects_completed: 0,
        status: "available" as const,
        health_status: "",
        safety_score: 100,
        certifications: [] as string[],
        is_active: true 
      })
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
    setEditDialogOpen(true)
    
    // Populate form data with pilot information
    setFormData({
      name: pilot.name || '',
      phone: pilot.phone || '',
      email: pilot.email || '',
      address: pilot.address || '',
      birthDate: pilot.birth_date || '',
      licenseNumber: pilot.uas_license_no || '',
      licenseExpiry: pilot.uas_license_expiry || '',
      totalFlightHours: pilot.total_flight_hours || 0,
      droneSprayingHours: pilot.agricultural_hours || 0,
      certifications: Array.isArray(pilot.certifications) ? pilot.certifications.join(', ') : '',
      specializations: '',
      emergencyContact: '',
      emergencyPhone: '',
      healthStatus: pilot.health_status || '',
      lastMedicalCheck: '',
      notes: ''
    })
  }

  const handleUpdatePilot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPilot) return
    
    setUpdating(true)
    try {
      const updateData = {
        id: editingPilot.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        birth_date: formData.birthDate,
        uas_license_no: formData.licenseNumber,
        uas_license_expiry: formData.licenseExpiry,
        total_flight_hours: formData.totalFlightHours,
        agricultural_hours: formData.droneSprayingHours,
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
        health_status: formData.healthStatus,
        notes: formData.notes,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone,
        specializations: formData.specializations
      }

      const response = await fetch("/api/pilots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      setEditingPilot(null)
      setEditingPilotId(null)
      setEditDialogOpen(false)
      fetchPilots()
      alert("อัพเดตข้อมูลสำเร็จ")
    } catch (error) {
      console.error("Error updating pilot:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถอัพเดตข้อมูลได้"}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelEditPilot = () => {
    setEditingPilot(null)
    setEditingPilotId(null)
    setEditDialogOpen(false)
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      birthDate: '',
      licenseNumber: '',
      licenseExpiry: '',
      totalFlightHours: 0,
      droneSprayingHours: 0,
      certifications: '',
      specializations: '',
      emergencyContact: '',
      emergencyPhone: '',
      healthStatus: '',
      lastMedicalCheck: '',
      notes: ''
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalFlightHours' || name === 'droneSprayingHours' ? 
        (value === '' ? 0 : parseInt(value) || 0) : value
    }))
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

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      available: { label: "พร้อมปฏิบัติงาน", color: "bg-green-500" },
      on_leave: { label: "ลาพัก", color: "bg-yellow-500" },
      training: { label: "อบรม", color: "bg-blue-500" },
      suspended: { label: "ระงับใช้งาน", color: "bg-red-500" },
      busy: { label: "ปฏิบัติงาน", color: "bg-purple-500" }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    )
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

  // Check license expiry
  const isLicenseExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysDiff <= 30 && daysDiff > 0
  }

  const isLicenseExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              จัดการนักบินโดรน
            </h1>
            <p className="text-gray-600 mt-2">ข้อมูลนักบินและการจัดการใบอนุญาต</p>
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
              <CardTitle className="text-sm font-medium">พร้อมปฏิบัติงาน</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pilots.filter(p => p.status === 'available').length}</div>
              <p className="text-xs text-gray-500">คนพร้อมปฏิบัติงาน</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ใบอนุญาตใกล้หมดอายุ</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pilots.filter(p => isLicenseExpiringSoon(p.uas_license_expiry)).length}
              </div>
              <p className="text-xs text-gray-500">ภายใน 30 วัน</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ประสบการณ์เฉลี่ย</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pilots.length > 0 ? Math.round(pilots.reduce((sum, p) => sum + p.experience_years, 0) / pilots.length) : 0}
              </div>
              <p className="text-xs text-gray-500">ปี</p>
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>เพิ่มนักบินใหม่</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
                  <TabsTrigger value="documents">เอกสาร/ใบอนุญาต</TabsTrigger>
                  <TabsTrigger value="experience">ประสบการณ์</TabsTrigger>
                  <TabsTrigger value="safety">ความปลอดภัย</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pilotName">ชื่อ-นามสกุล *</Label>
                      <Input
                        id="pilotName"
                        placeholder="ชื่อ นามสกุล"
                        value={newPilot.name}
                        onChange={(e) => setNewPilot({ ...newPilot, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pilotPhone">เบอร์โทรศัพท์ *</Label>
                      <Input
                        id="pilotPhone"
                        placeholder="0xx-xxx-xxxx"
                        value={newPilot.phone}
                        onChange={(e) => setNewPilot({ ...newPilot, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pilotEmail">อีเมล</Label>
                      <Input
                        id="pilotEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={newPilot.email}
                        onChange={(e) => setNewPilot({ ...newPilot, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pilotLineId">Line ID</Label>
                      <Input
                        id="pilotLineId"
                        placeholder="@lineid"
                        value={newPilot.line_id}
                        onChange={(e) => setNewPilot({ ...newPilot, line_id: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pilotAddress">ที่อยู่ปัจจุบัน</Label>
                    <Textarea
                      id="pilotAddress"
                      placeholder="ที่อยู่สำหรับติดต่อ"
                      value={newPilot.address}
                      onChange={(e) => setNewPilot({ ...newPilot, address: e.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nationalId">เลขบัตรประชาชน</Label>
                      <Input
                        id="nationalId"
                        placeholder="1-xxxx-xxxxx-xx-x"
                        value={newPilot.national_id}
                        onChange={(e) => setNewPilot({ ...newPilot, national_id: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="uasLicense">เลขใบอนุญาตบินโดรน</Label>
                      <Input
                        id="uasLicense"
                        placeholder="UAS-xxxxx"
                        value={newPilot.uas_license_no}
                        onChange={(e) => setNewPilot({ ...newPilot, uas_license_no: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseExpiry">วันหมดอายุใบอนุญาต</Label>
                      <Input
                        id="licenseExpiry"
                        type="date"
                        value={newPilot.uas_license_expiry}
                        onChange={(e) => setNewPilot({ ...newPilot, uas_license_expiry: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pilotStatus">สถานะ</Label>
                      <select
                        id="pilotStatus"
                        className="w-full p-2 border rounded-md"
                        value={newPilot.status}
                        onChange={(e) => setNewPilot({ ...newPilot, status: e.target.value as any })}
                      >
                        <option value="available">พร้อมปฏิบัติงาน</option>
                        <option value="on_leave">ลาพัก</option>
                        <option value="training">อบรม</option>
                        <option value="suspended">ระงับใช้งาน</option>
                        <option value="busy">ปฏิบัติงาน</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experienceYears">ประสบการณ์ (ปี)</Label>
                      <Input
                        id="experienceYears"
                        type="number"
                        min="0"
                        value={newPilot.experience_years}
                        onChange={(e) => setNewPilot({ ...newPilot, experience_years: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalFlightHours">ชั่วโมงบินรวม</Label>
                      <Input
                        id="totalFlightHours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={newPilot.total_flight_hours}
                        onChange={(e) => setNewPilot({ ...newPilot, total_flight_hours: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="agriculturalHours">ชั่วโมงบินเกษตร</Label>
                      <Input
                        id="agriculturalHours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={newPilot.agricultural_hours}
                        onChange={(e) => setNewPilot({ ...newPilot, agricultural_hours: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectsCompleted">โครงการที่เสร็จสิ้น</Label>
                      <Input
                        id="projectsCompleted"
                        type="number"
                        min="0"
                        value={newPilot.projects_completed}
                        onChange={(e) => setNewPilot({ ...newPilot, projects_completed: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="safety" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="healthStatus">สถานะสุขภาพ</Label>
                      <Input
                        id="healthStatus"
                        placeholder="สุขภาพดี / มีข้อจำกัด"
                        value={newPilot.health_status}
                        onChange={(e) => setNewPilot({ ...newPilot, health_status: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="safetyScore">คะแนนความปลอดภัย</Label>
                      <Input
                        id="safetyScore"
                        type="number"
                        min="0"
                        max="100"
                        value={newPilot.safety_score}
                        onChange={(e) => setNewPilot({ ...newPilot, safety_score: parseInt(e.target.value) || 100 })}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Certifications Section */}
                <div className="mt-6">
                  <Label>ใบรับรอง/การอบรม</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="เพิ่มใบรับรองใหม่"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                    />
                    <Button type="button" onClick={addCertification}>
                      เพิ่ม
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newPilot.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {cert}
                        <button onClick={() => removeCertification(index)} className="ml-1 text-red-500">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    checked={newPilot.is_active}
                    onCheckedChange={(checked) => setNewPilot({ ...newPilot, is_active: checked })}
                  />
                  <Label>เปิดใช้งาน</Label>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddPilotDialogOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="button" onClick={handleAddPilot}>
                    บันทึก
                  </Button>
                </div>
              </Tabs>
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
                    <TableHead>นักบิน</TableHead>
                    <TableHead>ข้อมูลติดต่อ</TableHead>
                    <TableHead>ประสบการณ์</TableHead>
                    <TableHead>ใบอนุญาต</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>คะแนน</TableHead>
                    <TableHead className="text-center">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pilots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <User className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-400">ไม่พบข้อมูลนักบิน</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pilots.map((pilot) => (
                      <TableRow key={pilot.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{pilot.name}</span>
                            <div className="flex flex-wrap gap-1">
                              {pilot.certifications.map((cert, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{pilot.phone}</span>
                            </div>
                            {pilot.email && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">📧 {pilot.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{pilot.experience_years} ปี</span>
                            {pilot.total_flight_hours && (
                              <span className="text-xs text-gray-500">
                                {pilot.total_flight_hours} ชม. บิน
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {pilot.uas_license_no ? (
                              <>
                                <span className="text-sm font-medium">{pilot.uas_license_no}</span>
                                {pilot.uas_license_expiry && (
                                  <div className="flex items-center gap-1">
                                    {isLicenseExpired(pilot.uas_license_expiry) ? (
                                      <Badge className="bg-red-100 text-red-800 text-xs">
                                        หมดอายุ
                                      </Badge>
                                    ) : isLicenseExpiringSoon(pilot.uas_license_expiry) ? (
                                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                        ใกล้หมดอายุ
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        ปกติ
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">ไม่มีข้อมูล</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(pilot.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {pilot.safety_score && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm">🛡️ {pilot.safety_score}%</span>
                              </div>
                            )}
                            {pilot.average_rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm">⭐ {pilot.average_rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPilot(pilot)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePilot(pilot.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

      {/* Edit Pilot Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลนักบิน</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdatePilot} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">ข้อมูลส่วนตัว</TabsTrigger>
                <TabsTrigger value="experience">ประสบการณ์</TabsTrigger>
                <TabsTrigger value="safety">ความปลอดภัย</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">ชื่อ-นามสกุล</Label>
                    <Input 
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">เบอร์โทรศัพท์</Label>
                    <Input 
                      id="edit-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">อีเมล</Label>
                    <Input 
                      id="edit-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-birthDate">วันเกิด</Label>
                    <Input 
                      id="edit-birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-address">ที่อยู่</Label>
                    <Textarea 
                      id="edit-address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="ที่อยู่ปัจจุบัน"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-licenseNumber">หมายเลขใบอนุญาต</Label>
                    <Input 
                      id="edit-licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-licenseExpiry">วันหมดอายุใบอนุญาต</Label>
                    <Input 
                      id="edit-licenseExpiry"
                      name="licenseExpiry"
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-totalFlightHours">ชั่วโมงบินรวม</Label>
                    <Input 
                      id="edit-totalFlightHours"
                      name="totalFlightHours"
                      type="number"
                      value={formData.totalFlightHours}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-droneSprayingHours">ชั่วโมงฉีดพ่นด้วยโดรน</Label>
                    <Input 
                      id="edit-droneSprayingHours"
                      name="droneSprayingHours"
                      type="number"
                      value={formData.droneSprayingHours}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-certifications">ใบรับรอง/การอบรม</Label>
                    <Textarea 
                      id="edit-certifications"
                      name="certifications"
                      value={formData.certifications}
                      onChange={handleInputChange}
                      placeholder="ระบุใบรับรองและการอบรมที่ได้รับ (คั่นด้วยเครื่องหมายจุลภาค)"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="safety" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-healthStatus">สถานะสุขภาพ</Label>
                    <Select 
                      name="healthStatus"
                      value={formData.healthStatus}
                      onValueChange={(value: string) => setFormData({...formData, healthStatus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานะสุขภาพ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">ดีเยี่ยม</SelectItem>
                        <SelectItem value="good">ดี</SelectItem>
                        <SelectItem value="fair">พอใช้</SelectItem>
                        <SelectItem value="poor">ไม่ดี</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-notes">หมายเหตุ</Label>
                    <Textarea 
                      id="edit-notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="หมายเหตุเพิ่มเติม"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancelEditPilot}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
