"use client"

import { useState, useEffect } from "react"
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
  Save,
  Loader2
} from "lucide-react"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    site_name: "Drone Booking Service",
    site_description: "บริการจองโดรนพ่นยาเกษตร",
    contact_email: "admin@dronebooking.com",
    contact_phone: "02-123-4567",
    
    // Notification Settings
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    
    // System Settings
    max_bookings_per_day: 10,
    booking_time_slots: 8,
    default_deposit: 1000,
    default_language: "th",
    
    // Theme Settings
    primary_color: "emerald",
    dark_mode: false,
    
    // Security Settings
    session_timeout: 30,
    require_two_factor: false,
    password_expiry: 90
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...result.data
          }))
        }
      } else {
        console.error('Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          alert('บันทึกการตั้งค่าเรียบร้อยแล้ว')
        } else {
          alert('เกิดข้อผิดพลาดในการบันทึก: ' + result.error)
        }
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">กำลังโหลดการตั้งค่า...</span>
        </div>
      ) : (
        <>
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                value={settings.site_name}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">คำอธิบายเว็บไซต์</Label>
              <Textarea
                id="siteDescription"
                value={settings.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">อีเมลติดต่อ</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">เบอร์โทรติดต่อ</Label>
              <Input
                id="contactPhone"
                value={settings.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
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
                checked={settings.email_notifications}
                onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>แจ้งเตือนทาง SMS</Label>
                <p className="text-sm text-gray-500">รับการแจ้งเตือนผ่าน SMS</p>
              </div>
              <Switch
                checked={settings.sms_notifications}
                onCheckedChange={(checked) => handleInputChange('sms_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>แจ้งเตือนแบบ Push</Label>
                <p className="text-sm text-gray-500">รับการแจ้งเตือนแบบ Push</p>
              </div>
              <Switch
                checked={settings.push_notifications}
                onCheckedChange={(checked) => handleInputChange('push_notifications', checked)}
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
                value={settings.max_bookings_per_day}
                onChange={(e) => handleInputChange('max_bookings_per_day', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeSlots">จำนวนช่วงเวลาการจอง</Label>
              <Input
                id="timeSlots"
                type="number"
                value={settings.booking_time_slots}
                onChange={(e) => handleInputChange('booking_time_slots', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultDeposit">ยอดมัดจำเริ่มต้น (บาท)</Label>
              <Input
                id="defaultDeposit"
                type="number"
                value={settings.default_deposit}
                onChange={(e) => handleInputChange('default_deposit', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">ภาษาเริ่มต้น</Label>
              <Select value={settings.default_language} onValueChange={(value) => handleInputChange('default_language', value)}>
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
              <Select value={settings.primary_color} onValueChange={(value) => handleInputChange('primary_color', value)}>
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
                checked={settings.dark_mode}
                onCheckedChange={(checked) => handleInputChange('dark_mode', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">เวลาหมดอายุ Session (นาที)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.session_timeout}
                onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>การยืนยันตัวตน 2 ขั้นตอน</Label>
                <p className="text-sm text-gray-500">เปิดใช้งาน 2FA</p>
              </div>
              <Switch
                checked={settings.require_two_factor}
                onCheckedChange={(checked) => handleInputChange('require_two_factor', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordExpiry">วันหมดอายุรหัสผ่าน (วัน)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                value={settings.password_expiry}
                onChange={(e) => handleInputChange('password_expiry', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  )
}
