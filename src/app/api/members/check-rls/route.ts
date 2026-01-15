import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// API สำหรับตรวจสอบ RLS policies
export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabase()
        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase is not configured' },
                { status: 500 }
            )
        }

        // ตรวจสอบ session
        const { data: { session } } = await supabase.auth.getSession()

        // ลองดึงข้อมูล members
        const { data: members, error: selectError } = await supabase
            .from('members')
            .select('*')
            .limit(5)

        // ลองสร้าง test member
        const { data: testInsert, error: insertError } = await supabase
            .from('members')
            .insert({
                user_name: 'test_rls_check',
                email: 'test@test.com',
                role_code: 'STAFF',
                status: true,
            })
            .select()

        // ถ้าสร้างสำเร็จ ให้ลบทิ้ง
        if (testInsert && testInsert.length > 0) {
            await supabase
                .from('members')
                .delete()
                .eq('id', testInsert[0].id)
        }

        return NextResponse.json({
            session: {
                hasSession: !!session,
                userId: session?.user?.id,
                userEmail: session?.user?.email,
            },
            selectTest: {
                success: !selectError,
                error: selectError?.message,
                count: members?.length || 0,
            },
            insertTest: {
                success: !insertError,
                error: insertError?.message,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
