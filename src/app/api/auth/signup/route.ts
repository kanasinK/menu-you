import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, user_name, nickname, role_code } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email และ Password จำเป็นต้องระบุ' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      )
    }

    // สร้าง user ใน Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: user_name || email.split('@')[0],
          nickname: nickname || '',
          role_code: role_code || 'STAFF',
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // รอสักครู่เพื่อให้ trigger สร้าง member record
    await new Promise(resolve => setTimeout(resolve, 1000))

    // ดึงข้อมูล member ที่ถูกสร้าง
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single()

    if (memberError) {
      console.error('Error fetching member:', memberError)
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      member: memberData,
      message: 'สร้างบัญชีผู้ใช้สำเร็จ',
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการสร้างบัญชี' },
      { status: 500 }
    )
  }
}

