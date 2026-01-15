import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withPermission } from '@/lib/api-auth'

// Helper: สร้าง supabase client พร้อม user token
function getSupabaseWithAuth(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) return null

    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '') ||
        request.cookies.get('sb-access-token')?.value

    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
    })
}

// GET - ดูข้อมูลตัวเอง
export async function GET(request: NextRequest) {
    return withPermission(request, 'profile:view', async (user) => {
        try {
            const supabase = getSupabaseWithAuth(request)
            if (!supabase) {
                return NextResponse.json(
                    { error: 'Supabase is not configured' },
                    { status: 500 }
                )
            }

            const { data: member, error } = await supabase
                .from('members')
                .select('id, user_name, nickname, email, role_code, status, created_date')
                .eq('auth_user_id', user.auth_user_id)
                .single()

            if (error || !member) {
                return NextResponse.json(
                    { error: 'ไม่พบข้อมูลโปรไฟล์' },
                    { status: 404 }
                )
            }

            return NextResponse.json({
                success: true,
                profile: member,
            })
        } catch (error: any) {
            return NextResponse.json(
                { error: error.message || 'เกิดข้อผิดพลาด' },
                { status: 500 }
            )
        }
    })
}

// PUT - แก้ไขข้อมูลตัวเอง (เฉพาะ nickname และ password)
export async function PUT(request: NextRequest) {
    return withPermission(request, 'profile:edit', async (user) => {
        try {
            const body = await request.json()
            const { nickname, password } = body

            const supabase = getSupabaseWithAuth(request)
            if (!supabase) {
                return NextResponse.json(
                    { error: 'Supabase is not configured' },
                    { status: 500 }
                )
            }

            // อัพเดท nickname ใน members table
            const { data: member, error: memberError } = await supabase
                .from('members')
                .update({
                    nickname: nickname || null,
                    updated_date: new Date().toISOString(),
                })
                .eq('auth_user_id', user.auth_user_id)
                .select()
                .single()

            if (memberError) {
                return NextResponse.json(
                    { error: `อัพเดทโปรไฟล์ไม่สำเร็จ: ${memberError.message}` },
                    { status: 400 }
                )
            }

            // อัพเดท password ถ้ามี
            if (password && password.length >= 6) {
                const { error: passwordError } = await supabase.auth.updateUser({
                    password,
                })

                if (passwordError) {
                    return NextResponse.json(
                        { error: `อัพเดทรหัสผ่านไม่สำเร็จ: ${passwordError.message}` },
                        { status: 400 }
                    )
                }
            }

            return NextResponse.json({
                success: true,
                profile: member,
                message: 'อัพเดทโปรไฟล์สำเร็จ',
            })
        } catch (error: any) {
            return NextResponse.json(
                { error: error.message || 'เกิดข้อผิดพลาด' },
                { status: 500 }
            )
        }
    })
}
