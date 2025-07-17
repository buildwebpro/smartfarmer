"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from '../lib/supabaseClient'
import { signInWithEmail, signUpWithEmail, signOut, getAdminUserByEmail } from '../lib/auth'

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true)
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
    getUser()
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const { data, error } = await signInWithEmail(email, password)
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
    setIsLoading(false)
  }

  const signup = async (email: string, password: string) => {
    setIsLoading(true)
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
    setIsLoading(false)
  }

  const logout = async () => {
    setIsLoading(true)
    await signOut()
    setUser(null)
    setIsLoading(false)
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
