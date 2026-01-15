import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

// API สำหรับทดสอบ auth admin functions
export async function POST(request: NextRequest) {
    try {
        const { email, password, user_name } = await request.json()

        const supabase = getSupabaseServer()
        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase is not configured' },
                { status: 500 }
            )
        }

        console.log('Testing auth admin with:', { email, user_name })

        // ทดสอบสร้าง auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                user_name,
            }
        })

        console.log('Auth admin result:', {
            success: !authError,
            userId: authData?.user?.id,
            error: authError
        })

        if (authError) {
            return NextResponse.json({
                success: false,
                error: authError.message,
                details: authError
            })
        }

        // ลบ user ที่สร้างทิ้ง (เพราะเป็นแค่ test)
        if (authData.user) {
            await supabase.auth.admin.deleteUser(authData.user.id)
            console.log('Test user deleted:', authData.user.id)
        }

        return NextResponse.json({
            success: true,
            message: 'Auth admin works! User created and deleted successfully',
            userId: authData.user?.id
        })
    } catch (error: any) {
        console.error('Test auth admin error:', error)
        return NextResponse.json(
            { error: error.message, stack: error.stack },
            { status: 500 }
        )
    }
}
