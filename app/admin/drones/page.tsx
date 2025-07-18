"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Zap, User, Plus, Edit, Wrench, Battery, Clock, MapPin } from "lucide-react"

interface DroneInfo {
  id: string
  name: string
  model: string
  status: "available" | "working" | "maintenance" | "repair"
  assignedPilot: string
  batteryLevel: number
  flightHours: number
  lastMaintenance: string
  nextMaintenance: string
  location: string
}

interface Pilot {
  id: string
  name: string
  phone: string
  experience: number
  certifications: string[]
  assignedDrones: string[]
}

export default function DroneManagement() {
  const [drones, setDrones] = useState<DroneInfo[]>([])
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [selectedDrone, setSelectedDrone] = useState<DroneInfo | null>(null)
  const [isAddingDrone, setIsAddingDrone] = useState(false)

  useEffect(() => {
    fetchDronesAndPilots()
  }, [])

  const fetchDronesAndPilots = async () => {
    // Mock data for demonstration
    const mockDrones: DroneInfo[] = [
      {
        id: "1",
        name: "โดรน #1",
        model: "DJI Agras T30",
        status: "available",
        assignedPilot: "นายสมศักดิ์ บินเก่ง",
        batteryLevel: 85,
        flightHours: 245,
        lastMaintenance: "2024-01-15",
        nextMaintenance: "2024-02-15",
        location: "ฐานหลัก",
      },
      {
        id: "2",
        name: "โดรน #2",
        model: "DJI Agras T30",
        status: "working",
        assignedPilot: "นายวิชัย เก่งมาก",
        batteryLevel: 45,
        flightHours: 189,
        lastMaintenance: "2024-01-10",
        nextMaintenance: "2024-02-10",
        location: "สวนทุเรียน นครปฐม",
      },
      {
        id: "3",
        name: "โดรน #3",
        model: "DJI Agras T20",
        status: "maintenance",
        assignedPilot: "นายประยุทธ์ ใจดี",
        batteryLevel: 0,
        flightHours: 312,
        lastMaintenance: "2024-01-18",
        nextMaintenance: "2024-01-20",
        location: "ศูนย์บำรุงรักษา",
      },
    ]

    const mockPilots: Pilot[] = [
      {
        id: "1",
        name: "นายสมศักดิ์ บินเก่ง",
        phone: "081-111-1111",
        experience: 3,
        certifications: ["ใบอนุญาตบินโดรน", "ใบรับรองพ่นยา"],
        assignedDrones: ["1"],
      },
      {
        id: "2",
        name: "นายวิชัย เก่งมาก",
        phone: "081-222-2222",
        experience: 5,
        certifications: ["ใบอนุญาตบินโดรน", "ใบรับรองพ่นยา", "ใบรับรองซ่อมบำรุง"],
        assignedDrones: ["2"],
      },
    ]

    setDrones(mockDrones)
    setPilots(mockPilots)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: "พร้อมใช้", variant: "default" as const, className: "bg-emerald-100 text-emerald-800" },
      working: { label: "กำลังทำงาน", variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      maintenance: { label: "บำรุงรักษา", variant: "destructive" as const, className: "bg-yellow-100 text-yellow-800" },
      repair: { label: "ซ่อมแซม", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-emerald-600"
    if (level > 30) return "text-yellow-600"
    return "text-red-600"
  }

  const handleStatusChange = (droneId: string, newStatus: string) => {
    setDrones(drones.map((drone) => (drone.id === droneId ? { ...drone, status: newStatus as any } : drone)))
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
              {drones.map((drone) => (
                <TableRow key={drone.id}>
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
                        onClick={() => setSelectedDrone(drone)}
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
                <TableHead>การดำเนินการ</TableHead>
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
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
