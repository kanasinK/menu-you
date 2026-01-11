import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'email จำเป็นต้องระบุ' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabasePublishableKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabasePublishableKey)

    // ดึงข้อมูล user จาก auth.users
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()
    
    if (fetchError) {
      console.error('Fetch users error:', fetchError)
      return NextResponse.json(
        { error: `Failed to fetch users: ${fetchError.message}` },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบ user นี้ในระบบ' },
        { status: 404 }
      )
    }

    // ยืนยัน email โดยอัตโนมัติ
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (updateError) {
      console.error('Update user error:', updateError)
      return NextResponse.json(
        { error: `Failed to confirm email: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'ยืนยัน email สำเร็จ',
      user: updateData.user
    })
  } catch (error: any) {
    console.error('Confirm email error:', error)
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการยืนยัน email' },
      { status: 500 }
    )
  }
}
