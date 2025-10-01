import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = {
  '/api/upload': 5,      // 5 uploads per minute
  '/api/bookings': 10,   // 10 bookings per minute
  '/api/auth': 15,       // 15 auth requests per minute
  default: 30            // 30 requests per minute for other endpoints
}

// Store for rate limiting (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)
  
  // Skip middleware for well-known paths (Chrome DevTools, etc.)
  if (pathname.startsWith('/.well-known/') || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/robots.txt') ||
      pathname.startsWith('/sitemap.xml')) {
    return NextResponse.next()
  }
  
  // Apply security headers
  const response = NextResponse.next()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting for API endpoints
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = checkRateLimit(clientIP, pathname)
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            ...securityHeaders
          }
        }
      )
    }
  }

  // Admin route protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // ตรวจสอบจาก Supabase cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const projectRef = supabaseUrl?.split('//')[1]?.split('.')[0]

    // Check all possible Supabase cookie patterns
    const cookieNames = [
      `sb-${projectRef}-auth-token`,
      `sb-${projectRef}-auth-token-code-verifier`,
      'sb-access-token',
      'supabase-auth-token',
    ]

    let hasAuthCookie = false
    for (const cookieName of cookieNames) {
      const cookie = request.cookies.get(cookieName)
      if (cookie?.value) {
        hasAuthCookie = true
        console.log(`Middleware: Found auth cookie: ${cookieName}`)
        break
      }
    }

    // Debug: log all cookies
    const allCookies = request.cookies.getAll()
    console.log('Middleware: All cookies:', allCookies.map(c => c.name))

    // ถ้าไม่มี token ให้ redirect ไปหน้า login
    if (!hasAuthCookie) {
      console.log('Middleware: No auth cookie found, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // CSRF protection for state-changing operations
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (origin && !isValidOrigin(origin, host)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid origin' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json', ...securityHeaders }
        }
      )
    }
  }

  return response
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

function checkRateLimit(clientIP: string, pathname: string): { allowed: boolean; resetTime: number } {
  const now = Date.now()
  const key = `${clientIP}:${pathname}`
  
  // Determine rate limit for this endpoint
  let maxRequests = MAX_REQUESTS.default
  for (const [path, limit] of Object.entries(MAX_REQUESTS)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      maxRequests = limit
      break
    }
  }

  const current = requestCounts.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or initialize counter
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, resetTime: now + RATE_LIMIT_WINDOW }
  }

  if (current.count >= maxRequests) {
    return { allowed: false, resetTime: current.resetTime }
  }

  // Increment counter
  current.count++
  return { allowed: true, resetTime: current.resetTime }
}

function isValidOrigin(origin: string, host: string | null): boolean {
  if (!host) return false

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://drone-booking-app.vercel.app'
  const validOrigins = [
    `https://${host}`,
    `http://${host}`,
    baseUrl,
  ]

  // Only allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    validOrigins.push('http://localhost:3000', 'http://localhost:3001')
  }

  return validOrigins.includes(origin)
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
  ],
}
