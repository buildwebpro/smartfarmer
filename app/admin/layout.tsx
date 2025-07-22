"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ModernNavigation } from "@/components/modern-navigation"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // ✅ Debug logging เพื่อดูสถานะ
  useEffect(() => {
    console.log('AdminLayout - user:', user)
    console.log('AdminLayout - isLoading:', isLoading)
    console.log('AdminLayout - pathname:', pathname)
  }, [user, isLoading, pathname])

  // ✅ ตรวจสอบการล็อคอิน และ redirect ถ้าไม่ได้ล็อคอิน (ยกเว้นหน้า login)
  useEffect(() => {
    if (!isLoading && !user && !pathname.includes('/login')) {
      console.log('AdminLayout - Redirecting to login')
      router.replace("/admin/login") // ใช้ replace แทน push
    }
  }, [user, isLoading, router, pathname])

  // ✅ ถ้าเป็นหน้า login ให้แสดงเลยไม่ต้องรอ (ใช้ usePathname แทน window.location)
  if (pathname.includes('/login')) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  // ถ้ายังไม่ได้ login หรือกำลังโหลด ให้แสดง loading screen
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  // ถ้าไม่ได้ login ให้แสดงหน้าเปล่าขณะ redirect
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavigation user={user} />
      <main className="lg:pl-72">
        <div className="lg:pt-4">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
} 