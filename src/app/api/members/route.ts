import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { withPermission } from '@/lib/api-auth'

// API สำหรับดึงข้อมูล members จาก Supabase
export async function GET(request: NextRequest) {
  return withPermission(request, 'members:view', async (user) => {
    try {
      const supabase = getSupabase()

      if (!supabase) {
        return NextResponse.json(
          { error: 'Supabase is not configured' },
          { status: 500 }
        )
      }

      const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .order('created_date', { ascending: false })

      if (error) {
        console.error('Members API error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch members' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        members: members || [],
        count: members?.length || 0,
      })
    } catch (error: any) {
      console.error('Members API error:', error)
      return NextResponse.json(
        { error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก' },
        { status: 500 }
      )
    }
  })
}

// API สำหรับสร้าง member ใหม่
export async function POST(request: NextRequest) {
  return withPermission(request, 'members:create', async (user) => {
    try {
      const body = await request.json()
      const { user_name, nickname, email, password, role_code, status = true } = body

      if (!user_name) {
        return NextResponse.json(
          { error: 'user_name จำเป็นต้องระบุ' },
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

      const { data: member, error } = await supabase
        .from('members')
        .insert({
          user_name,
          nickname: nickname || null,
          email: email || null,
          password,
          role_code: role_code || 'STAFF',
          status,
        })
        .select()
        .single()

      if (error) {
        console.error('Create member error:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        member,
        message: 'สร้างสมาชิกสำเร็จ',
      })
    } catch (error: any) {
      console.error('Create member error:', error)
      return NextResponse.json(
        { error: error.message || 'เกิดข้อผิดพลาดในการสร้างสมาชิก' },
        { status: 500 }
      )
    }
  })
}
