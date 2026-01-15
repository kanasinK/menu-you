import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withPermission } from '@/lib/api-auth'
import { getSupabaseServer } from '@/lib/supabase'

// Helper: สร้าง supabase client พร้อม user token
function getSupabaseWithAuth(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) return null

    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '') ||
        request.cookies.get('sb-access-token')?.value

    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
    })

    return supabase
}

// PUT - Update member
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withPermission(request, 'members:edit', async () => {
        try {
            const { id } = await params
            const body = await request.json()
            const { user_name, nickname, email, password, role_code, status } = body

            const supabase = getSupabaseServer()
            if (!supabase) {
                return NextResponse.json(
                    { error: 'Supabase is not configured' },
                    { status: 500 }
                )
            }

            // ตรวจสอบว่า email เป็น required
            if (!email) {
                return NextResponse.json(
                    { error: 'อีเมลจำเป็นต้องระบุ' },
                    { status: 400 }
                )
            }

            // Build update object, only include password if provided
            const updateData: Record<string, unknown> = {
                user_name,
                nickname,
                email,
                role_code,
                status,
                updated_date: new Date().toISOString(),
            }

            // ตรวจสอบว่า member มีอยู่จริงก่อน update
            const { data: existingMember, error: checkError } = await supabase
                .from('members')
                .select('*')
                .eq('id', id)
                .maybeSingle()

            if (checkError) {
                return NextResponse.json(
                    { error: `ตรวจสอบสมาชิกไม่สำเร็จ: ${checkError.message}` },
                    { status: 400 }
                )
            }

            if (!existingMember) {
                return NextResponse.json(
                    { error: `ไม่พบสมาชิก ID: ${id}` },
                    { status: 404 }
                )
            }

            // ถ้า member ไม่มี auth_user_id ให้สร้าง auth user ใหม่
            let authUserId = existingMember.auth_user_id

            if (!authUserId) {
                // ต้องมี password เพื่อสร้าง auth user
                if (!password || password.length < 6) {
                    return NextResponse.json(
                        { error: 'สมาชิกนี้ยังไม่มีบัญชี Authentication กรุณาระบุรหัสผ่าน (อย่างน้อย 6 ตัวอักษร) เพื่อสร้างบัญชี' },
                        { status: 400 }
                    )
                }

                // สร้าง auth user ด้วย admin API
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true,
                    user_metadata: {
                        user_name,
                        nickname,
                        role_code,
                    },
                })

                if (authError || !authData.user) {
                    return NextResponse.json(
                        { error: `สร้าง auth user ไม่สำเร็จ: ${authError?.message}` },
                        { status: 400 }
                    )
                }

                authUserId = authData.user.id
                updateData.auth_user_id = authUserId
            }

            const { data: member, error } = await supabase
                .from('members')
                .update(updateData)
                .eq('id', id)
                .select()

            if (error) {
                return NextResponse.json({
                    error: `อัปเดตไม่สำเร็จ: ${error.message}`,
                }, { status: 400 })
            }

            if (!member || member.length === 0) {
                return NextResponse.json(
                    { error: 'อัปเดตไม่สำเร็จ' },
                    { status: 400 }
                )
            }

            return NextResponse.json({
                success: true,
                member: member[0],
                message: 'อัปเดตสมาชิกสำเร็จ',
            })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
            return NextResponse.json({ error: message }, { status: 500 })
        }
    })
}

// DELETE - Delete member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withPermission(request, 'members:delete', async () => {
        try {
            const { id } = await params

            // ใช้ service role client เพื่อ bypass RLS และลบ auth user
            const supabaseAdmin = getSupabaseServer()

            if (!supabaseAdmin) {
                return NextResponse.json(
                    { error: 'Supabase is not configured' },
                    { status: 500 }
                )
            }

            // ตรวจสอบว่า member มีอยู่จริงก่อนลบ
            const { data: existingMember, error: checkError } = await supabaseAdmin
                .from('members')
                .select('id, auth_user_id')
                .eq('id', id)
                .maybeSingle()

            if (checkError) {
                return NextResponse.json(
                    { error: `ตรวจสอบสมาชิกไม่สำเร็จ: ${checkError.message}` },
                    { status: 400 }
                )
            }

            if (!existingMember) {
                return NextResponse.json(
                    { error: `ไม่พบสมาชิก ID: ${id}` },
                    { status: 404 }
                )
            }

            // ลบ member จาก members table
            const { data: deletedMember, error: deleteError } = await supabaseAdmin
                .from('members')
                .delete()
                .eq('id', id)
                .select()

            if (deleteError) {
                return NextResponse.json({ error: deleteError.message }, { status: 400 })
            }

            if (!deletedMember || deletedMember.length === 0) {
                return NextResponse.json(
                    { error: 'ลบสมาชิกไม่สำเร็จ' },
                    { status: 400 }
                )
            }

            // ลบ auth user ถ้ามี auth_user_id
            if (existingMember.auth_user_id) {
                await supabaseAdmin.auth.admin.deleteUser(existingMember.auth_user_id)
            }

            return NextResponse.json({
                success: true,
                message: 'ลบสมาชิกสำเร็จ',
            })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
            return NextResponse.json({ error: message }, { status: 500 })
        }
    })
}
