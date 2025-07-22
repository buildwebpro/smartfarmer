import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login - Drone Service',
  description: 'Admin login page for drone service management',
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}