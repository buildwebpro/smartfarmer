"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      if (!code) {
        throw new Error('No authorization code received')
      }

      // Verify state
      const savedState = sessionStorage.getItem('line_state')
      if (state !== savedState) {
        throw new Error('Invalid state parameter')
      }

      // Get selected role
      const selectedRole = sessionStorage.getItem('selected_role') || 'farmer'

      // Exchange code for LINE profile
      const response = await fetch('/api/auth/line/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, role: selectedRole })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Authentication failed')
      }

      // Clear session storage
      sessionStorage.removeItem('line_state')
      sessionStorage.removeItem('selected_role')

      // Save user info to localStorage and cookies
      localStorage.setItem('user', JSON.stringify(result.user))
      localStorage.setItem('user_role', result.user.role)

      // Set cookies for middleware
      document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=86400` // 24 hours
      document.cookie = `user_role=${result.user.role}; path=/; max-age=86400` // 24 hours

      // Redirect based on role
      if (result.user.role === 'farmer') {
        router.push('/farmer/dashboard')
      } else if (result.user.role === 'provider') {
        router.push('/provider/dashboard')
      } else {
        router.push('/admin/dashboard')
      }
    } catch (error: any) {
      console.error('Auth callback error:', error)
      setError(error.message)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            เข้าสู่ระบบล้มเหลว
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          กำลังเข้าสู่ระบบ...
        </h2>
        <p className="text-gray-600">
          กรุณารอสักครู่ระหว่างที่เราตรวจสอบข้อมูลของคุณ
        </p>
      </div>
    </div>
  )
}
