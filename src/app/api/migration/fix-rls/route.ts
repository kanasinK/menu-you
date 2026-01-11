import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabasePublishableKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabasePublishableKey)

    // ปิด RLS สำหรับ members table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE members DISABLE ROW LEVEL SECURITY;'
    })

    if (error) {
      console.error('RLS disable error:', error)
      return NextResponse.json(
        { error: `Failed to disable RLS: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'RLS disabled for members table',
      data
    })
  } catch (error: any) {
    console.error('RLS fix error:', error)
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการแก้ไข RLS' },
      { status: 500 }
    )
  }
}
