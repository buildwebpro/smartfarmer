import type { ReactNode } from "react"
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        {/* Sidebar menu */}
        <div className="flex flex-col h-full w-full">
          <nav className="p-4 border-b">
            <ul className="space-y-2">
              <li><a href="/admin/orders" className="font-semibold">จัดการ Order</a></li>
              <li><a href="/admin/crop-types">จัดการชนิดพืช</a></li>
              <li><a href="/admin/spray-types">จัดการชนิดสารพ่น</a></li>
            </ul>
          </nav>
        </div>
      </Sidebar>
      <main className="flex-1 min-h-screen bg-gray-50">
        {children}
      </main>
    </SidebarProvider>
  )
} 