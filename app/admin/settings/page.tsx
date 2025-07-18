"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings, 
  User, 
  Bell, 
  Mail, 
  Shield, 
  Database, 
  Palette,
  Globe,
  Save
} from "lucide-react"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Drone Booking Service",
    siteDescription: "บริการจองโดรนพ่นยาเกษตร",
    contactEmail: "admin@dronebooking.com",
    contactPhone: "02-123-4567",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // System Settings
    maxBookingsPerDay: 10,
    bookingTimeSlots: 8,
    defaultDeposit: 1000,
    
    // Theme Settings
    primaryColor: "emerald",
    darkMode: false,
    
    // Language Settings
    defaultLanguage: "th",
    
    // Security Settings
    sessionTimeout: 30,
    requireTwoFactor: false,
    passwordExpiry: 90
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert('บันทึกการตั้งค่าเรียบร้อยแล้ว')
  }

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            ตั้งค่าระบบ
          </h1>
          <p className="text-gray-600 mt-2">จัดการการตั้งค่าระบบและการกำหนดค่าต่างๆ</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSaving ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              บันทึกการตั้งค่า
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-600" />
              ตั้งค่าทั่วไป
            </CardTitle>
            <CardDescription>ข้อมูลพื้นฐานของระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">ชื่อเว็บไซต์</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">คำอธิบายเว็บไซต์</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">อีเมลติดต่อ</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">เบอร์โทรติดต่อ</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600" />
              การแจ้งเตือน
            </CardTitle>
            <CardDescription>ตั้งค่าการแจ้งเตือนต่างๆ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>แจ้งเตือนทางอีเมล</Label>
                <p className="text-sm text-gray-500">รับการแจ้งเตือนผ่านอีเมล</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>แจ้งเตือนทาง SMS</Label>
                <p className="text-sm text-gray-500">รับการแจ้งเตือนผ่าน SMS</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>แจ้งเตือนแบบ Push</Label>
                <p className="text-sm text-gray-500">รับการแจ้งเตือนแบบ Push</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" />
              ตั้งค่าระบบ
            </CardTitle>
            <CardDescription>การตั้งค่าการทำงานของระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxBookings">จำนวนการจองสูงสุดต่อวัน</Label>
              <Input
                id="maxBookings"
                type="number"
                value={settings.maxBookingsPerDay}
                onChange={(e) => handleInputChange('maxBookingsPerDay', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeSlots">จำนวนช่วงเวลาการจอง</Label>
              <Input
                id="timeSlots"
                type="number"
                value={settings.bookingTimeSlots}
                onChange={(e) => handleInputChange('bookingTimeSlots', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultDeposit">ยอดมัดจำเริ่มต้น (บาท)</Label>
              <Input
                id="defaultDeposit"
                type="number"
                value={settings.defaultDeposit}
                onChange={(e) => handleInputChange('defaultDeposit', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">ภาษาเริ่มต้น</Label>
              <Select value={settings.defaultLanguage} onValueChange={(value) => handleInputChange('defaultLanguage', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="th">ภาษาไทย</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Theme & Security Settings */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              ธีมและความปลอดภัย
            </CardTitle>
            <CardDescription>ตั้งค่าธีมและการรักษาความปลอดภัย</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">สีหลักของธีม</Label>
              <Select value={settings.primaryColor} onValueChange={(value) => handleInputChange('primaryColor', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emerald">เขียวมรกต</SelectItem>
                  <SelectItem value="blue">น้ำเงิน</SelectItem>
                  <SelectItem value="purple">ม่วง</SelectItem>
                  <SelectItem value="orange">ส้ม</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>โหมดมืด</Label>
                <p className="text-sm text-gray-500">เปิดใช้งานโหมดมืด</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleInputChange('darkMode', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">เวลาหมดอายุ Session (นาที)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>การยืนยันตัวตน 2 ขั้นตอน</Label>
                <p className="text-sm text-gray-500">เปิดใช้งาน 2FA</p>
              </div>
              <Switch
                checked={settings.requireTwoFactor}
                onCheckedChange={(checked) => handleInputChange('requireTwoFactor', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordExpiry">วันหมดอายุรหัสผ่าน (วัน)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => handleInputChange('passwordExpiry', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
