"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { Zap, User, Plus, Edit, Wrench, Battery, Clock, MapPin, Trash2 } from "lucide-react"

interface DroneInfo {
  id: string
  name: string
  model: string
  status: "available" | "working" | "maintenance" | "repair"
  assignedPilot: string | null
  assignedPilotId?: string | null
  batteryLevel: number
  flightHours: number
  lastMaintenance: string | null
  nextMaintenance: string | null
  location: string
}

interface PilotInfo {
  id: string
  name: string
  phone: string
  experience: number
  certifications: string[]
  assignedDrones: string[]
}

interface EditDroneFormProps {
  drone: DroneInfo
  pilots: PilotInfo[]
  onSave: (drone: DroneInfo) => void
  onCancel: () => void
}

interface AddDroneFormProps {
  pilots: PilotInfo[]
  onSave: (drone: DroneInfo) => void
  onCancel: () => void
}

function EditDroneForm({ drone, pilots, onSave, onCancel }: EditDroneFormProps) {
  const [formData, setFormData] = useState({
    name: drone.name,
    model: drone.model,
    status: drone.status,
    assignedPilotId: drone.assignedPilotId || '',
    batteryLevel: drone.batteryLevel,
    flightHours: drone.flightHours,
    location: drone.location,
    lastMaintenance: drone.lastMaintenance || '',
    nextMaintenance: drone.nextMaintenance || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/drones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: drone.id,
          ...formData,
          assignedPilotId: formData.assignedPilotId || null
        }),
      })

      if (response.ok) {
        const updatedDrone: DroneInfo = {
          ...drone,
          ...formData,
          assignedPilot: formData.assignedPilotId 
            ? pilots.find(p => p.id === formData.assignedPilotId)?.name || null 
            : null
        }
        onSave(updatedDrone)
      } else {
        console.error('Failed to update drone')
      }
    } catch (error) {
      console.error('Error updating drone:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อโดรน</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">รุ่น</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">สถานะ</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            className="w-full p-2 border rounded-md"
          >
            <option value="available">พร้อมใช้</option>
            <option value="working">กำลังทำงาน</option>
            <option value="maintenance">บำรุงรักษา</option>
            <option value="repair">ซ่อมแซม</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">นักบิน</label>
          <select
            value={formData.assignedPilotId}
            onChange={(e) => setFormData({...formData, assignedPilotId: e.target.value})}
            className="w-full p-2 border rounded-md"
          >
            <option value="">ไม่ระบุ</option>
            {pilots.map((pilot) => (
              <option key={pilot.id} value={pilot.id}>
                {pilot.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">แบตเตอรี่ (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.batteryLevel}
            onChange={(e) => setFormData({...formData, batteryLevel: parseInt(e.target.value)})}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ชั่วโมงบิน</label>
          <input
            type="number"
            min="0"
            value={formData.flightHours}
            onChange={(e) => setFormData({...formData, flightHours: parseInt(e.target.value)})}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">สถานที่</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">บำรุงรักษาครั้งล่าสุด</label>
          <input
            type="date"
            value={formData.lastMaintenance}
            onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">บำรุงรักษาครั้งถัดไป</label>
          <input
            type="date"
            value={formData.nextMaintenance}
            onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          บันทึก
        </Button>
      </div>
    </form>
  )
}

function AddDroneForm({ pilots, onSave, onCancel }: AddDroneFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    status: 'available' as const,
    assignedPilotId: '',
    batteryLevel: 100,
    flightHours: 0,
    location: 'ฐานหลัก',
    lastMaintenance: '',
    nextMaintenance: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/drones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assignedPilotId: formData.assignedPilotId || null
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const newDrone: DroneInfo = {
          id: result.data.id.toString(),
          name: formData.name,
          model: formData.model,
          status: formData.status,
          assignedPilot: formData.assignedPilotId 
            ? pilots.find(p => p.id === formData.assignedPilotId)?.name || null 
            : null,
          assignedPilotId: formData.assignedPilotId || null,
          batteryLevel: formData.batteryLevel,
          flightHours: formData.flightHours,
          location: formData.location,
          lastMaintenance: formData.lastMaintenance || null,
          nextMaintenance: formData.nextMaintenance || null
        }
        onSave(newDrone)
      } else {
        console.error('Failed to add drone')
      }
    } catch (error) {
      console.error('Error adding drone:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อโดรน *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">รุ่น *</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">สถานะ</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            className="w-full p-2 border rounded-md"
          >
            <option value="available">พร้อมใช้</option>
            <option value="working">กำลังทำงาน</option>
            <option value="maintenance">บำรุงรักษา</option>
            <option value="repair">ซ่อมแซม</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">นักบิน</label>
          <select
            value={formData.assignedPilotId}
            onChange={(e) => setFormData({...formData, assignedPilotId: e.target.value})}
            className="w-full p-2 border rounded-md"
          >
            <option value="">ไม่ระบุ</option>
            {pilots.map((pilot) => (
              <option key={pilot.id} value={pilot.id}>
                {pilot.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">แบตเตอรี่ (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.batteryLevel}
            onChange={(e) => setFormData({...formData, batteryLevel: parseInt(e.target.value)})}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ชั่วโมงบิน</label>
          <input
            type="number"
            min="0"
            value={formData.flightHours}
            onChange={(e) => setFormData({...formData, flightHours: parseInt(e.target.value)})}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">สถานที่</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">บำรุงรักษาครั้งล่าสุด</label>
          <input
            type="date"
            value={formData.lastMaintenance}
            onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">บำรุงรักษาครั้งถัดไป</label>
          <input
            type="date"
            value={formData.nextMaintenance}
            onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          เพิ่มโดรน
        </Button>
      </div>
    </form>
  )
}

export default function DronesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [drones, setDrones] = useState<DroneInfo[]>([])
  const [pilots, setPilots] = useState<PilotInfo[]>([])
  const [selectedDrone, setSelectedDrone] = useState<DroneInfo | null>(null)
  const [isAddingDrone, setIsAddingDrone] = useState(false)
  const [editingDrone, setEditingDrone] = useState<DroneInfo | null>(null)
  const [isEditingDrone, setIsEditingDrone] = useState(false)

  useEffect(() => {
    fetchDronesAndPilots()
  }, [])

  const fetchDronesAndPilots = async () => {
    try {
      console.log('[Drones Page] Fetching drones and pilots...')

      // Fetch drones and pilots from APIs
      const [dronesResponse, pilotsResponse] = await Promise.all([
        fetch('/api/drones'),
        fetch('/api/pilots')
      ])

      console.log('[Drones Page] Drones response status:', dronesResponse.status)

      if (dronesResponse.ok) {
        const dronesData = await dronesResponse.json()
        console.log('[Drones Page] Drones data:', dronesData)

        if (dronesData.data) {
          const transformedDrones = dronesData.data.map((drone: any) => ({
            id: drone.id.toString(),
            name: drone.name,
            model: drone.model,
            status: drone.status || "available",
            assignedPilot: drone.assignedPilot || "ยังไม่ได้มอบหมาย",
            assignedPilotId: drone.assignedPilotId,
            batteryLevel: drone.batteryLevel || 0,
            flightHours: drone.flightHours || 0,
            lastMaintenance: drone.lastMaintenance || null,
            nextMaintenance: drone.nextMaintenance || null,
            location: drone.location || "ไม่ทราบตำแหน่ง",
          }))
          console.log('[Drones Page] Transformed drones:', transformedDrones.length, 'items')
          setDrones(transformedDrones)
        } else {
          console.log('[Drones Page] No drones data in response')
        }
      } else {
        const errorData = await dronesResponse.json()
        console.error('[Drones Page] Error response:', errorData)
      }

      if (pilotsResponse.ok) {
        const pilotsData = await pilotsResponse.json()
        if (pilotsData.data) {
          const transformedPilots = pilotsData.data.map((pilot: any) => ({
            id: pilot.id.toString(),
            name: pilot.name,
            phone: pilot.phone,
            experience: pilot.experience_years || 0,
            certifications: pilot.certifications || [],
            assignedDrones: [],
          }))
          setPilots(transformedPilots)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setDrones([])
      setPilots([])
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: "พร้อมใช้", variant: "default" as const, className: "bg-emerald-100 text-emerald-800" },
      working: { label: "กำลังทำงาน", variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      maintenance: { label: "บำรุงรักษา", variant: "destructive" as const, className: "bg-yellow-100 text-yellow-800" },
      repair: { label: "ซ่อมแซม", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-emerald-600"
    if (level > 30) return "text-yellow-600"
    return "text-red-600"
  }

  const handleStatusChange = async (droneId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/drones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: droneId,
          status: newStatus
        }),
      })

      if (response.ok) {
        setDrones(drones.map((drone) => 
          drone.id === droneId ? { ...drone, status: newStatus as any } : drone
        ))
      } else {
        console.error('Failed to update drone status')
      }
    } catch (error) {
      console.error('Error updating drone status:', error)
    }
  }

  const handleDeleteDrone = async (droneId: string) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบโดรนนี้?')) {
      return
    }

    try {
      const response = await fetch('/api/drones', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: droneId }),
      })

      if (response.ok) {
        setDrones(drones.filter(drone => drone.id !== droneId))
      } else {
        console.error('Failed to delete drone')
      }
    } catch (error) {
      console.error('Error deleting drone:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            จัดการโดรน
          </h1>
          <p className="text-gray-600 mt-2">ข้อมูลโดรนและนักบินในระบบ</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddingDrone(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มโดรน
          </Button>
        </div>
      </div>

      {/* Drone Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โดรนทั้งหมด</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Zap className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drones.length}</div>
            <p className="text-xs text-gray-500">ลำในระบบ</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">พร้อมใช้งาน</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Battery className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drones.filter(d => d.status === 'available').length}</div>
            <p className="text-xs text-gray-500">ลำพร้อมใช้</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำลังทำงาน</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drones.filter(d => d.status === 'working').length}</div>
            <p className="text-xs text-gray-500">ลำที่ทำงาน</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักบิน</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pilots.length}</div>
            <p className="text-xs text-gray-500">คนในทีม</p>
          </CardContent>
        </Card>
      </div>

      {/* Drones Table */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">รายการโดรน</CardTitle>
          <CardDescription>จัดการและติดตามสถานะโดรนทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ลำดับ</TableHead>
                <TableHead>ชื่อโดรน</TableHead>
                <TableHead>รุ่น</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>นักบิน</TableHead>
                <TableHead>แบตเตอรี่</TableHead>
                <TableHead>ชั่วโมงบิน</TableHead>
                <TableHead>สถานที่</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drones.map((drone, index) => (
                <TableRow key={drone.id}>
                  <TableCell className="font-medium text-gray-500">{index + 1}</TableCell>
                  <TableCell className="font-medium">{drone.name}</TableCell>
                  <TableCell>{drone.model}</TableCell>
                  <TableCell>{getStatusBadge(drone.status)}</TableCell>
                  <TableCell>{drone.assignedPilot}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Battery className={`h-4 w-4 ${getBatteryColor(drone.batteryLevel)}`} />
                      <span className={getBatteryColor(drone.batteryLevel)}>
                        {drone.batteryLevel}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{drone.flightHours} ชม.</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{drone.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingDrone(drone)
                          setIsEditingDrone(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(drone.id, 'maintenance')}
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDrone(drone.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pilots Table */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">รายการนักบิน</CardTitle>
          <CardDescription>จัดการข้อมูลนักบินและการมอบหมายงาน</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>ประสบการณ์</TableHead>
                <TableHead>ใบรับรอง</TableHead>
                <TableHead>โดรนที่รับผิดชอบ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pilots.map((pilot) => (
                <TableRow key={pilot.id}>
                  <TableCell className="font-medium">{pilot.name}</TableCell>
                  <TableCell>{pilot.phone}</TableCell>
                  <TableCell>{pilot.experience} ปี</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {pilot.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {pilot.assignedDrones.map((droneId) => {
                        const drone = drones.find(d => d.id === droneId)
                        return drone ? (
                          <Badge key={droneId} variant="secondary" className="text-xs">
                            {drone.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Drone Dialog */}
      <Dialog open={isEditingDrone} onOpenChange={setIsEditingDrone}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลโดรน</DialogTitle>
            <DialogDescription>
              อัปเดตข้อมูลโดรนในระบบ
            </DialogDescription>
          </DialogHeader>
          {editingDrone && (
            <EditDroneForm 
              drone={editingDrone}
              pilots={pilots}
              onSave={(updatedDrone) => {
                setDrones(drones.map(d => d.id === updatedDrone.id ? updatedDrone : d))
                setIsEditingDrone(false)
                setEditingDrone(null)
              }}
              onCancel={() => {
                setIsEditingDrone(false)
                setEditingDrone(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Drone Dialog */}
      <Dialog open={isAddingDrone} onOpenChange={setIsAddingDrone}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มโดรนใหม่</DialogTitle>
            <DialogDescription>
              เพิ่มโดรนใหม่เข้าสู่ระบบ
            </DialogDescription>
          </DialogHeader>
          <AddDroneForm 
            pilots={pilots}
            onSave={(newDrone) => {
              setDrones([...drones, newDrone])
              setIsAddingDrone(false)
            }}
            onCancel={() => {
              setIsAddingDrone(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
