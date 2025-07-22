'use client'
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Edit, Trash2, RefreshCw, Shield, User, UserCheck, UserX, Crown } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
  last_login?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  
  // ถ้าไม่ใช่ admin ให้แสดงหน้า access denied
  if (!isAdmin && !loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
            <p className="text-sm text-gray-500 mt-2">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถจัดการผู้ใช้งานได้</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }
  
  // User states
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({ 
    email: "", 
    full_name: "", 
    password: "",
    role: "user" as 'admin' | 'user',
    is_active: true 
  })
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      if (!res.ok) {
        if (res.status === 503) {
          const error = await res.json()
          console.error("Service unavailable:", error.error)
          setUsers([])
          return
        }
        throw new Error("Failed to fetch users")
      }
      const { data } = await res.json()
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    }
    setLoading(false)
  }

  useEffect(() => { 
    fetchUsers()
  }, [])

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.full_name || !newUser.password) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      setNewUser({ email: "", full_name: "", password: "", role: "user", is_active: true })
      setIsAddUserDialogOpen(false)
      fetchUsers()
      alert("เพิ่มผู้ใช้สำเร็จ")
    } catch (error) {
      console.error("Error adding user:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถเพิ่มข้อมูลได้"}`)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditingUserId(user.id)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      setEditingUser(null)
      setEditingUserId(null)
      fetchUsers()
      alert("อัพเดตข้อมูลสำเร็จ")
    } catch (error) {
      console.error("Error updating user:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถอัพเดตข้อมูลได้"}`)
    }
  }

  const handleCancelEditUser = () => {
    setEditingUser(null)
    setEditingUserId(null)
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบผู้ใช้นี้?")) return
    
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "เกิดข้อผิดพลาด")
      }
      
      fetchUsers()
      alert("ลบข้อมูลสำเร็จ")
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้"}`)
    }
  }

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge variant="destructive" className="bg-red-600"><Crown className="h-3 w-3 mr-1" />Admin</Badge>
    }
    return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />User</Badge>
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge variant="default" className="bg-green-600"><UserCheck className="h-3 w-3 mr-1" />Active</Badge>
    }
    return <Badge variant="destructive"><UserX className="h-3 w-3 mr-1" />Inactive</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              จัดการผู้ใช้งาน
            </h1>
            <p className="text-gray-600 mt-1">จัดการข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchUsers}
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
              <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-gray-500">บัญชีในระบบ</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ดูแลระบบ</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <Crown className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
              <p className="text-xs text-gray-500">Admin accounts</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ใช้งานทั่วไป</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</div>
              <p className="text-xs text-gray-500">User accounts</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ใช้งานปัจจุบัน</CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.is_active).length}</div>
              <p className="text-xs text-gray-500">Active users</p>
            </CardContent>
          </Card>
        </div>

        {/* Add User Button */}
        <div className="flex justify-end">
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มผู้ใช้ใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userEmail">อีเมล</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="userName">ชื่อ-นามสกุล</Label>
                  <Input
                    id="userName"
                    placeholder="ชื่อ นามสกุล"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="userPassword">รหัสผ่าน</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    placeholder="รหัสผ่าน"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="userRole">บทบาท</Label>
                  <Select value={newUser.role} onValueChange={(value: 'admin' | 'user') => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกบทบาท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">ผู้ใช้งานทั่วไป</SelectItem>
                      <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="userActive"
                    checked={newUser.is_active}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, is_active: checked })}
                  />
                  <Label htmlFor="userActive">เปิดใช้งาน</Label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                    เพิ่ม
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">รายการผู้ใช้งาน</CardTitle>
            <CardDescription>จัดการข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง</CardDescription>
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
                    <TableHead>อีเมล</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>บทบาท</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead className="text-center">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-400">ไม่พบข้อมูลผู้ใช้งาน</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Input
                              value={editingUser?.email ?? ""}
                              onChange={(e) => setEditingUser({ ...editingUser!, email: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{user.email}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Input
                              value={editingUser?.full_name ?? ""}
                              onChange={(e) => setEditingUser({ ...editingUser!, full_name: e.target.value })}
                            />
                          ) : (
                            <span className="font-medium">{user.full_name}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Select 
                              value={editingUser?.role} 
                              onValueChange={(value: 'admin' | 'user') => setEditingUser({ ...editingUser!, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">ผู้ใช้งานทั่วไป</SelectItem>
                                <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            getRoleBadge(user.role)
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Switch
                              checked={editingUser?.is_active ?? false}
                              onCheckedChange={(checked) => setEditingUser({ ...editingUser!, is_active: checked })}
                            />
                          ) : (
                            getStatusBadge(user.is_active)
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            {editingUserId === user.id ? (
                              <>
                                <Button size="sm" onClick={handleUpdateUser} className="bg-blue-600 hover:bg-blue-700">
                                  บันทึก
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEditUser}>
                                  ยกเลิก
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {isAdmin && (
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
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
