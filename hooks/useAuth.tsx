"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from '../lib/supabaseBrowser'
import { signInWithEmailAndGetAdminData, signUpWithEmail, signOut, getAdminUserByEmail } from '../lib/auth'

const supabase = createClient()

interface User {
  id: string
  email: string
  username?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // ✅ เริ่มต้นเป็น true เพื่อตรวจสอบ auth state

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true)
      
      // ✅ ตรวจสอบ Supabase auth ปกติ (ไม่ใช้ cache)
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        // ดึงข้อมูล admin user จากตาราง admin_users
        const { data: adminData } = await getAdminUserByEmail(data.user.email!)
        if (adminData) {
          setUser({
            id: adminData.id,
            email: adminData.email,
            username: adminData.username,
            role: adminData.role,
          })
        } else {
          setUser({ id: data.user.id, email: data.user.email! })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
    
    // ✅ เรียก getUser() ตั้งแต่แรกเพื่อตรวจสอบ auth state
    getUser()
    
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser() // ✅ จะเรียกก็ต่อเมื่อมีการเปลี่ยนแปลง auth state
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  // ✅ ปรับปรุงฟังก์ชัน login ให้ใช้ query เดียว
  const login = async (email: string, password: string) => {
    console.log('useAuth - login started for:', email)
    setIsLoading(true)
    try {
      console.log('useAuth - calling signInWithEmailAndGetAdminData...')
      const { data, error, adminData } = await signInWithEmailAndGetAdminData(email, password)
      console.log('useAuth - signInWithEmailAndGetAdminData result:', {
        hasData: !!data,
        hasError: !!error,
        hasAdminData: !!adminData,
        adminRole: adminData?.role
      })
      
      if (error) {
        console.log('useAuth - throwing error:', error)
        throw error
      }
      
      if (data?.user) {
        // ใช้ข้อมูล admin ที่ได้มาจาก query เดียว
        const userData = adminData ? {
          id: adminData.id,
          email: adminData.email,
          username: adminData.username,
          role: adminData.role,
        } : { id: data.user.id, email: data.user.email! }
        
        console.log('useAuth - setting user data:', userData)
        setUser(userData)
        console.log('useAuth - user state updated successfully')
      } else {
        console.log('useAuth - no user data found in result')
      }
    } catch (error) {
      console.error('useAuth - login error:', error)
      throw error
    } finally {
      console.log('useAuth - setting isLoading to false')
      setIsLoading(false)
      console.log('useAuth - login completed')
    }
  }

  // ✅ ปรับปรุงฟังก์ชัน signup ให้ใช้ query เดียว
  const signup = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await signUpWithEmail(email, password)
      if (error) throw error
      
      if (data?.user) {
        const { data: adminData } = await getAdminUserByEmail(email)
        if (adminData) {
          setUser({
            id: adminData.id,
            email: adminData.email,
            username: adminData.username,
            role: adminData.role,
          })
        } else {
          setUser({ id: data.user.id, email: data.user.email! })
        }
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ ปรับปรุงฟังก์ชัน logout ให้เร็วขึ้น
  const logout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
