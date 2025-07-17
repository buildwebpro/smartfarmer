"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  username: string
  role: "admin" | "operator" | "pilot"
}

interface AuthContextType {
  user: User | null
  login: (token: string, userData: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_name")
    const userRole = localStorage.getItem("user_role")

    if (token && userData && userRole) {
      setUser({
        id: "1",
        name: userData,
        username: userData,
        role: userRole as "admin" | "operator" | "pilot",
      })
    }
    setIsLoading(false)
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user_name", userData.name)
    localStorage.setItem("user_role", userData.role)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_name")
    localStorage.removeItem("user_role")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
