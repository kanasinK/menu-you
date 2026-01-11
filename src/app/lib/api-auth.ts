import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hasPermission, Permission } from './permissions'

export interface ApiUser {
    id: string
    email: string
    user_name?: string
    role_code?: string
    auth_user_id?: string
}

export interface AuthResult {
    user: ApiUser | null
    error: string | null
    status: number
}

/**
 * ดึงข้อมูล user จาก request (server-side)
 */
export async function getApiUser(request: NextRequest): Promise<AuthResult> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

        if (!supabaseUrl || !supabaseKey) {
            return { user: null, error: 'Supabase not configured', status: 500 }
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // ดึง token จาก Authorization header หรือ cookie
        const authHeader = request.headers.get('authorization')
        const accessToken = authHeader?.replace('Bearer ', '') ||
            request.cookies.get('sb-access-token')?.value

        if (!accessToken) {
            return { user: null, error: 'ไม่พบ token', status: 401 }
        }

        // Verify token และดึง user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken)

        if (authError || !authUser) {
            return { user: null, error: 'Token ไม่ถูกต้องหรือหมดอายุ', status: 401 }
        }

        // ดึงข้อมูล member จาก database
        const { data: member, error: memberError } = await supabase
            .from('members')
            .select('id, user_name, email, role_code, status')
            .eq('auth_user_id', authUser.id)
            .single()

        if (memberError || !member) {
            return { user: null, error: 'ไม่พบข้อมูลสมาชิก', status: 401 }
        }

        if (!member.status) {
            return { user: null, error: 'บัญชีถูกระงับ', status: 403 }
        }

        return {
            user: {
                id: member.id,
                email: member.email || authUser.email || '',
                user_name: member.user_name,
                role_code: member.role_code,
                auth_user_id: authUser.id,
            },
            error: null,
            status: 200,
        }
    } catch (error) {
        console.error('API auth error:', error)
        return { user: null, error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์', status: 500 }
    }
}

/**
 * Middleware wrapper สำหรับ API routes ที่ต้องการ authentication
 */
export async function withAuth(
    request: NextRequest,
    handler: (user: ApiUser) => Promise<NextResponse>
): Promise<NextResponse> {
    const { user, error, status } = await getApiUser(request)

    if (!user) {
        return NextResponse.json({ error }, { status })
    }

    return handler(user)
}

/**
 * Middleware wrapper สำหรับ API routes ที่ต้องการ permission เฉพาะ
 */
export async function withPermission(
    request: NextRequest,
    permission: Permission,
    handler: (user: ApiUser) => Promise<NextResponse>
): Promise<NextResponse> {
    const { user, error, status } = await getApiUser(request)

    if (!user) {
        return NextResponse.json({ error }, { status })
    }

    if (!hasPermission(user.role_code, permission)) {
        return NextResponse.json(
            { error: 'ไม่มีสิทธิ์ในการดำเนินการนี้' },
            { status: 403 }
        )
    }

    return handler(user)
}

/**
 * ตรวจสอบ permission และ return error response ถ้าไม่มีสิทธิ์
 */
export function checkPermission(
    user: ApiUser,
    permission: Permission
): NextResponse | null {
    if (!hasPermission(user.role_code, permission)) {
        return NextResponse.json(
            { error: 'ไม่มีสิทธิ์ในการดำเนินการนี้' },
            { status: 403 }
        )
    }
    return null
}

/**
 * Helper สำหรับสร้าง unauthorized response
 */
export function unauthorizedResponse(message = 'กรุณาเข้าสู่ระบบ') {
    return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Helper สำหรับสร้าง forbidden response
 */
export function forbiddenResponse(message = 'ไม่มีสิทธิ์ในการดำเนินการนี้') {
    return NextResponse.json({ error: message }, { status: 403 })
}
