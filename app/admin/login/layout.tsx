import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login - SmartFarmer',
  description: 'Admin login page for SmartFarmer agricultural service management',
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