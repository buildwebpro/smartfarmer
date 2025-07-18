"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Zap, 
  Wheat, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "จัดการออร์เดอร์",
    href: "/admin/orders",
    icon: ShoppingCart,
    badge: "12"
  },
  {
    name: "จัดการโดรน",
    href: "/admin/drones",
    icon: Zap,
  },
  {
    name: "จัดการพืชและยาพ่น",
    href: "/admin/crop-types",
    icon: Wheat,
  },
  {
    name: "ตั้งค่าระบบ",
    href: "/admin/settings",
    icon: Settings,
  }
]

interface ModernNavProps {
  user: any
}

export function ModernNavigation({ user }: ModernNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-emerald-900 to-emerald-800 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xl font-bold text-white">Drone Admin</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                            isActive
                              ? "bg-emerald-700 text-white"
                              : "text-emerald-200 hover:text-white hover:bg-emerald-700"
                          )}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="ml-auto bg-emerald-600 text-white hover:bg-emerald-600"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-white">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-emerald-600 text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Admin</div>
                    <div className="text-xs text-emerald-200 truncate">{user?.email}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-200 hover:text-white hover:bg-emerald-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-2 shadow-sm border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Drone Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-gradient-to-b from-emerald-900 to-emerald-800 py-6 shadow-xl">
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-xl font-bold text-white">Drone Admin</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-emerald-700">
                  <div className="space-y-2 py-6">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-x-3 rounded-md p-3 text-base font-semibold leading-7 mx-4",
                            isActive
                              ? "bg-emerald-700 text-white"
                              : "text-emerald-200 hover:text-white hover:bg-emerald-700"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="ml-auto bg-emerald-600 text-white"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                  <div className="py-6">
                    <div className="flex items-center gap-x-4 px-4 py-3 text-base font-semibold leading-7 text-white">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-emerald-600 text-white">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Admin</div>
                        <div className="text-xs text-emerald-200 truncate">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top bar for desktop */}
      <div className="hidden lg:flex lg:pl-72">
        <div className="flex w-full items-center justify-between bg-white px-6 py-4 shadow-sm border-b">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500">
                3
              </Badge>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-emerald-600 text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </>
  )
}
