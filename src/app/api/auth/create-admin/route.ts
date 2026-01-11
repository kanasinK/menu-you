import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(_request: NextRequest) {
  try {
    // ใช้ anon key สำหรับ admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabasePublishableKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabasePublishableKey)

    // ดึงข้อมูล admins จาก members table
    const { data: admins, error } = await supabase
      .from('members')
      .select('*')
      .eq('role_code', 'SUPER_ADMIN')
      .order('created_date', { ascending: false })

    if (error) {
      console.error('Error fetching admins:', error)
      return NextResponse.json(
        { error: 'Failed to fetch admin data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      admins: admins || [],
      count: admins?.length || 0,
    })
  } catch (error: unknown) {
    console.error('Create admin API error:', error)
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล admin'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, user_name, nickname } = body

    if (!email || !password || !user_name) {
      return NextResponse.json(
        { error: 'email, password และ user_name จำเป็นต้องระบุ' },
        { status: 400 }
      )
    }

    // ใช้ anon key สำหรับ admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabasePublishableKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabasePublishableKey)

    // สร้าง user ใน auth.users โดยข้ามการยืนยัน email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name,
          nickname: nickname || user_name,
          role_code: 'SUPER_ADMIN'
        },
        emailRedirectTo: undefined // ไม่ส่ง confirmation email
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // รอ trigger และ poll หา member หลายรอบ (กันกรณี trigger ช้า)
    const pollMember = async () => {
      for (let attempt = 0; attempt < 6; attempt++) {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('auth_user_id', authData.user!.id)
          .single()
        if (!error && data) return { data }
        await new Promise(r => setTimeout(r, 500))
      }
      return { data: null }
    }

    let { data: memberData } = await pollMember()

    if (!memberData) {
      // ถ้าไม่พบ ให้ลอง insert เอง (อาจโดน RLS/duplicate)
      const { data: newMember, error: insertError } = await supabase
        .from('members')
        .insert({
          auth_user_id: authData.user.id,
          user_name,
          nickname: nickname || user_name,
          email,
          role_code: 'SUPER_ADMIN',
          status: true
        })
        .select()
        .single()

      if (insertError) {
        // ถ้า insert ล้มเหลว (เช่น RLS/duplicate) ให้ re-fetch อีกครั้ง
        const { data: fetchedAfterInsert } = await supabase
          .from('members')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .single()

        if (!fetchedAfterInsert) {
          return NextResponse.json(
            { error: `Failed to create member: ${insertError.message}` },
            { status: 400 }
          )
        }

        memberData = fetchedAfterInsert
      } else {
        memberData = newMember
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: memberData.id,
        email: memberData.email,
        user_name: memberData.user_name,
        nickname: memberData.nickname,
        role_code: memberData.role_code,
        status: memberData.status
      },
      message: 'Super Admin สร้างสำเร็จ',
      credentials: {
        email,
        password
      }
    })
  } catch (error: unknown) {
    console.error('Create admin error:', error)
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้าง Super Admin'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}