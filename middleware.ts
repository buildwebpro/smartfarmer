import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // ✅ ปิดการใช้งาน middleware ชั่วคราว เพื่อไม่ให้เกิดปัญหา
  return NextResponse.next()
  
  /*
  const { pathname } = request.nextUrl

  // ป้องกันเส้นทาง /admin (ยกเว้น /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // ตรวจสอบจาก Supabase cookies
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value
    
    // ถ้าไม่มี token ใดๆ เลย ให้ redirect ไปหน้า login
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
