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
import { Zap, User, Plus, Edit, Wrench } from "lucide-react"
import Link from "next/link"

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
        certifications: ["ใบอนุญาตนักบินโดรน", "การพ่นยาเกษตร"],
        assignedDrones: ["1"],
      },
      {
        id: "2",
        name: "นายวิชัย เก่งมาก",
        phone: "082-222-2222",
        experience: 5,
        certifications: ["ใบอนุญาตนักบินโดรน", "การพ่นยาเกษตร", "ความปลอดภัย"],
        assignedDrones: ["2"],
      },
      {
        id: "3",
        name: "นายประยุทธ์ ใจดี",
        phone: "083-333-3333",
        experience: 2,
        certifications: ["ใบอนุญาตนักบินโดรน"],
        assignedDrones: ["3"],
      },
    ]

    setDrones(mockDrones)
    setPilots(mockPilots)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: "พร้อมใช้", variant: "default" as const, color: "text-green-600" },
      working: { label: "กำลังทำงาน", variant: "secondary" as const, color: "text-blue-600" },
      maintenance: { label: "บำรุงรักษา", variant: "secondary" as const, color: "text-yellow-600" },
      repair: { label: "ซ่อมแซม", variant: "destructive" as const, color: "text-red-600" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-green-600"
    if (level > 30) return "text-yellow-600"
    return "text-red-600"
  }

  const updateDroneStatus = async (droneId: string, newStatus: string) => {
    setDrones(drones.map((drone) => (drone.id === droneId ? { ...drone, status: newStatus as any } : drone)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการโดรนและนักบิน</h1>
            <p className="text-gray-600">จัดการโดรน นักบิน และการบำรุงรักษา</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddingDrone(true)}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มโดรน
            </Button>
            <Link href="/admin">
              <Button variant="outline">กลับหน้าหลัก</Button>
            </Link>
          </div>
        </div>

        {/* Drone Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">โดรนทั้งหมด</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drones.length}</div>
              <p className="text-xs text-muted-foreground">ลำ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">พร้อมใช้งาน</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {drones.filter((d) => d.status === "available").length}
              </div>
              <p className="text-xs text-muted-foreground">ลำ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กำลังทำงาน</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {drones.filter((d) => d.status === "working").length}
              </div>
              <p className="text-xs text-muted-foreground">ลำ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักบิน</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pilots.length}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
        </div>

        {/* Drones Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>รายการโดรน</CardTitle>
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
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>การจัดการ</TableHead>
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
                      <span className={getBatteryColor(drone.batteryLevel)}>{drone.batteryLevel}%</span>
                    </TableCell>
                    <TableCell>{drone.flightHours} ชม.</TableCell>
                    <TableCell>{drone.location}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedDrone(drone)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>จัดการ {selectedDrone?.name}</DialogTitle>
                              <DialogDescription>แก้ไขข้อมูลและสถานะโดรน</DialogDescription>
                            </DialogHeader>
                            {selectedDrone && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>ชื่อโดรน</Label>
                                    <Input value={selectedDrone.name} />
                                  </div>
                                  <div>
                                    <Label>รุ่น</Label>
                                    <Input value={selectedDrone.model} />
                                  </div>
                                  <div>
                                    <Label>สถานะ</Label>
                                    <Select
                                      value={selectedDrone.status}
                                      onValueChange={(value) => updateDroneStatus(selectedDrone.id, value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="available">พร้อมใช้</SelectItem>
                                        <SelectItem value="working">กำลังทำงาน</SelectItem>
                                        <SelectItem value="maintenance">บำรุงรักษา</SelectItem>
                                        <SelectItem value="repair">ซ่อมแซม</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>นักบินที่รับผิดชอบ</Label>
                                    <Select value={selectedDrone.assignedPilot}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {pilots.map((pilot) => (
                                          <SelectItem key={pilot.id} value={pilot.name}>
                                            {pilot.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>ระดับแบตเตอรี่</Label>
                                    <Input type="number" value={selectedDrone.batteryLevel} min="0" max="100" />
                                  </div>
                                  <div>
                                    <Label>ชั่วโมงบิน</Label>
                                    <Input type="number" value={selectedDrone.flightHours} />
                                  </div>
                                  <div>
                                    <Label>การบำรุงรักษาครั้งล่าสุด</Label>
                                    <Input type="date" value={selectedDrone.lastMaintenance} />
                                  </div>
                                  <div>
                                    <Label>การบำรุงรักษาครั้งถัดไป</Label>
                                    <Input type="date" value={selectedDrone.nextMaintenance} />
                                  </div>
                                </div>
                                <div>
                                  <Label>ตำแหน่งปัจจุบัน</Label>
                                  <Input value={selectedDrone.location} />
                                </div>
                                <div className="flex gap-2">
                                  <Button>บันทึกการเปลี่ยนแปลง</Button>
                                  <Button variant="outline">
                                    <Wrench className="h-4 w-4 mr-2" />
                                    กำหนดการบำรุงรักษา
                                  </Button>
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

        {/* Pilots Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการนักบิน</CardTitle>
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
                  <TableHead>การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pilots.map((pilot) => (
                  <TableRow key={pilot.id}>
                    <TableCell className="font-medium">{pilot.name}</TableCell>
                    <TableCell>{pilot.phone}</TableCell>
                    <TableCell>{pilot.experience} ปี</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {pilot.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pilot.assignedDrones.map((droneId) => {
                        const drone = drones.find((d) => d.id === droneId)
                        return drone ? (
                          <Badge key={droneId} variant="outline" className="mr-1">
                            {drone.name}
                          </Badge>
                        ) : null
                      })}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
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
    </div>
  )
}
