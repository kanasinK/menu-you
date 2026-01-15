import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { withPermission } from '@/lib/api-auth'

// API สำหรับดึงข้อมูล members จาก Supabase
export async function GET(request: NextRequest) {
  return withPermission(request, 'members:view', async (user) => {
    try {
      const supabase = getSupabaseServer()

      if (!supabase) {
        return NextResponse.json(
          { error: 'Supabase is not configured' },
          { status: 500 }
        )
      }

      const { data: members, error } = await supabase
        .from('members')
        .select('id, user_name, nickname, email, role_code, status, auth_user_id, created_date, updated_date')
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

      if (!email) {
        return NextResponse.json(
          { error: 'email จำเป็นต้องระบุ' },
          { status: 400 }
        )
      }

      if (!password || password.length < 6) {
        return NextResponse.json(
          { error: 'password จำเป็นต้องระบุและมีความยาวอย่างน้อย 6 ตัวอักษร' },
          { status: 400 }
        )
      }

      const supabase = getSupabaseServer()

      if (!supabase) {
        return NextResponse.json(
          { error: 'Supabase is not configured' },
          { status: 500 }
        )
      }

      // 1. สร้าง auth user ด้วย admin API (ใช้ service role key)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          user_name,
          nickname,
          role_code: role_code || 'STAFF',
        },
      })

      if (authError) {
        console.error('Create auth user error:', authError)
        return NextResponse.json(
          { error: `สร้าง auth user ไม่สำเร็จ: ${authError.message}` },
          { status: 400 }
        )
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'สร้าง auth user ไม่สำเร็จ' },
          { status: 400 }
        )
      }

      // 2. รอให้ trigger สร้าง member record
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 3. ดึงข้อมูล member ที่ถูกสร้างโดย trigger
      let { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single()

      // 4. ถ้า trigger สร้าง member แล้ว ให้อัพเดท nickname และ role_code
      if (member) {
        const { data: updatedMember, error: updateError } = await supabase
          .from('members')
          .update({
            nickname: nickname || null,
            role_code: role_code || 'STAFF',
            status,
          })
          .eq('id', member.id)
          .select()
          .single()

        if (!updateError && updatedMember) {
          member = updatedMember
        }
      }

      // 5. ถ้า trigger ไม่ได้สร้าง member ให้สร้างเอง
      if (memberError || !member) {
        console.log('Trigger did not create member, creating manually...')
        const { data: newMember, error: createError } = await supabase
          .from('members')
          .insert({
            auth_user_id: authData.user.id,
            user_name,
            nickname: nickname || null,
            email,
            role_code: role_code || 'STAFF',
            status,
          })
          .select()
          .single()

        if (createError) {
          console.error('Create member error:', createError)
          return NextResponse.json(
            { error: `สร้างสมาชิกไม่สำเร็จ: ${createError.message}` },
            { status: 400 }
          )
        }
        member = newMember
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
