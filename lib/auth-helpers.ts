import { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export interface AuthUser {
  id: string
  email: string
  role?: string
}

/**
 * Verify user authentication and return user data
 * Use this in API routes to protect endpoints
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role,
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

/**
 * Check if user has admin role
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AuthUser | null> {
  const user = await verifyAuth(request)

  if (!user) {
    return null
  }

  // Check if user is admin in admin_users table
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('role, email')
      .eq('email', user.email)
      .single()

    if (error || !adminUser || adminUser.role !== 'admin') {
      return null
    }

    return {
      ...user,
      role: adminUser.role,
    }
  } catch (error) {
    console.error('Admin verification error:', error)
    return null
  }
}

/**
 * Create standardized auth error response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

/**
 * Create standardized forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
