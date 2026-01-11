import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// หน้าที่ไม่ต้อง validate authentication
const publicPaths = ['/order', '/test-auth']

// หน้าที่เป็น auth pages
const authPaths = ['/login']

// Route permissions mapping (role -> allowed routes)
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/members': ['SUPER_ADMIN', 'ADMIN'],
  '/masters': ['SUPER_ADMIN', 'ADMIN'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ข้าม API routes และ static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ข้ามหน้า /order (ไม่ต้อง validate)
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  let isAuthenticated = false
  let userRoleCode: string | null = null

  // ลองตรวจสอบ Supabase session ก่อน
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (supabaseUrl && supabasePublishableKey) {
      const supabase = createClient(supabaseUrl, supabasePublishableKey)

      // ดึง token จาก cookie
      const accessToken = request.cookies.get('sb-access-token')?.value
      const refreshToken = request.cookies.get('sb-refresh-token')?.value

      if (accessToken && refreshToken) {
        const { data: { user } } = await supabase.auth.getUser(accessToken)

        if (user) {
          isAuthenticated = true

          // ดึง role จาก members table
          const { data: member } = await supabase
            .from('members')
            .select('role_code')
            .eq('auth_user_id', user.id)
            .single()

          userRoleCode = member?.role_code || null
        }
      }
    }
  } catch (error) {
    console.error('Supabase auth check error:', error)
  }

  // Fallback: ตรวจสอบ authentication จาก cookie แบบเดิม
  if (!isAuthenticated) {
    isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true'
  }

  // ถ้าเข้าหน้า login/auth แต่ login แล้ว -> redirect ไป dashboard
  if (authPaths.some(path => pathname.startsWith(path))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // ถ้ายังไม่ login และพยายามเข้าหน้าอื่นๆ -> redirect ไป login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ตรวจสอบ role-based access (ถ้ามี role)
  if (userRoleCode) {
    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    )

    if (matchedRoute) {
      const allowedRoles = ROUTE_PERMISSIONS[matchedRoute]
      if (!allowedRoles.includes(userRoleCode)) {
        // ไม่มีสิทธิ์ -> redirect ไป dashboard พร้อม error
        const dashboardUrl = new URL('/dashboard', request.url)
        dashboardUrl.searchParams.set('error', 'forbidden')
        return NextResponse.redirect(dashboardUrl)
      }
    }
  }

  return NextResponse.next()
}

// กำหนด paths ที่ต้องรัน middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
