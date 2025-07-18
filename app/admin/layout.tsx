"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ModernNavigation } from "@/components/modern-navigation"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  // ถ้ายังไม่ได้ login หรือกำลังโหลด จะไม่แสดง sidebar
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavigation user={user} />
      <main className="lg:pl-72">
        <div className="lg:pt-20">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
} 