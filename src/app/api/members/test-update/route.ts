import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

// API สำหรับทดสอบ update member
export async function POST(request: NextRequest) {
    try {
        const { id, email } = await request.json()

        const supabase = getSupabaseServer()
        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase is not configured' },
                { status: 500 }
            )
        }

        // 1. ตรวจสอบว่า member มีอยู่
        const { data: existing, error: checkError } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        console.log('1. Check existing:', { existing, checkError })

        if (!existing) {
            return NextResponse.json({ error: 'Member not found', id })
        }

        // 2. ลอง update แค่ email
        const { data: updated, error: updateError } = await supabase
            .from('members')
            .update({ email, updated_date: new Date().toISOString() })
            .eq('id', id)
            .select()

        console.log('2. Update result:', { updated, updateError })

        // 3. ตรวจสอบอีกครั้งหลัง update
        const { data: afterUpdate, error: afterError } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        console.log('3. After update:', { afterUpdate, afterError })

        return NextResponse.json({
            step1_existing: existing,
            step2_update: { data: updated, error: updateError?.message },
            step3_afterUpdate: afterUpdate,
            success: !updateError && updated && updated.length > 0
        })
    } catch (error: any) {
        console.error('Test update error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
