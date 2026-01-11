import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { withPermission } from '@/lib/api-auth'

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

            const supabase = getSupabase()
            if (!supabase) {
                return NextResponse.json(
                    { error: 'Supabase is not configured' },
                    { status: 500 }
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

            if (password) {
                updateData.password = password
            }

            const { data: member, error } = await supabase
                .from('members')
                .update(updateData)
                .eq('id', id)
                .select()
                .single()

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 })
            }

            return NextResponse.json({
                success: true,
                member,
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
            const supabase = getSupabase()

            if (!supabase) {
                return NextResponse.json(
                    { error: 'Supabase is not configured' },
                    { status: 500 }
                )
            }

            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', id)

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 })
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
