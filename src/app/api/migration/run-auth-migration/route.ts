import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// API สำหรับรัน SQL migration
// ⚠️ ใช้เฉพาะใน development เท่านั้น

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบว่าอยู่ใน development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'API นี้ใช้ได้เฉพาะใน development mode เท่านั้น' },
        { status: 403 }
      )
    }

    const supabase = getSupabase()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured. กรุณาตั้งค่า .env.local' },
        { status: 500 }
      )
    }

    // SQL statements สำหรับ migration
    const migrationSQL = [
      // เพิ่ม column auth_user_id
      `ALTER TABLE members ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);`,
      
      // สร้าง index สำหรับ auth_user_id
      `CREATE INDEX IF NOT EXISTS idx_members_auth_user_id ON members(auth_user_id);`,
      
      // สร้าง function สำหรับสร้าง member อัตโนมัติ
      `CREATE OR REPLACE FUNCTION public.handle_new_user()
       RETURNS TRIGGER AS $$
       BEGIN
         INSERT INTO public.members (auth_user_id, user_name, email, role_code, status)
         VALUES (
           NEW.id,
           COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1)),
           NEW.email,
           COALESCE(NEW.raw_user_meta_data->>'role_code', 'STAFF'),
           TRUE
         );
         RETURN NEW;
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER;`,
      
      // สร้าง trigger
      `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
      `CREATE TRIGGER on_auth_user_created
       AFTER INSERT ON auth.users
       FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,
      
      // เพิ่ม unique constraint
      `ALTER TABLE members ADD CONSTRAINT unique_auth_user_id UNIQUE (auth_user_id);`
    ]

    const results = []
    const errors = []

    // รัน SQL statements ทีละตัว
    for (let i = 0; i < migrationSQL.length; i++) {
      const sql = migrationSQL[i]
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
        
        if (error) {
          // บาง statements อาจมี error ถ้า column มีอยู่แล้ว (ไม่เป็นไร)
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('column') && error.message.includes('already exists')) {
            results.push({ step: i + 1, sql, status: 'skipped', message: error.message })
          } else {
            errors.push({ step: i + 1, sql, error: error.message })
          }
        } else {
          results.push({ step: i + 1, sql, status: 'success', data })
        }
      } catch (err: any) {
        errors.push({ step: i + 1, sql, error: err.message })
      }
    }

    // สร้าง member records สำหรับ users ที่มีอยู่แล้ว
    const { data: existingUsers, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (!usersError && existingUsers?.users) {
      for (const user of existingUsers.users) {
        try {
          // ตรวจสอบว่ามี member record อยู่แล้วหรือไม่
          const { data: existingMember } = await supabase
            .from('members')
            .select('id')
            .eq('auth_user_id', user.id)
            .single()

          if (!existingMember) {
            // สร้าง member record
            const { data: newMember, error: memberError } = await supabase
              .from('members')
              .insert({
                auth_user_id: user.id,
                user_name: user.user_metadata?.user_name || user.email?.split('@')[0] || 'user',
                email: user.email,
                role_code: user.user_metadata?.role_code || 'STAFF',
                status: true,
              })
              .select()
              .single()

            if (memberError) {
              errors.push({ 
                step: 'create_member', 
                user_id: user.id, 
                error: memberError.message 
              })
            } else {
              results.push({ 
                step: 'create_member', 
                user_id: user.id, 
                email: user.email,
                status: 'success',
                member: newMember
              })
            }
          }
        } catch (err: any) {
          errors.push({ 
            step: 'create_member', 
            user_id: user.id, 
            error: err.message 
          })
        }
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: 'Migration completed',
      results,
      errors,
      summary: {
        totalSteps: migrationSQL.length,
        successfulSteps: results.filter(r => r.status === 'success').length,
        skippedSteps: results.filter(r => r.status === 'skipped').length,
        errorSteps: errors.length,
        membersCreated: results.filter(r => r.step === 'create_member').length
      }
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการรัน migration' },
      { status: 500 }
    )
  }
}

// API สำหรับตรวจสอบสถานะ migration
export async function GET() {
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      )
    }

    // ตรวจสอบว่า column auth_user_id มีอยู่หรือไม่
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'members')
      .eq('column_name', 'auth_user_id')

    // ตรวจสอบว่า function มีอยู่หรือไม่
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'handle_new_user')

    // ตรวจสอบว่า trigger มีอยู่หรือไม่
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name')
      .eq('trigger_name', 'on_auth_user_created')

    // นับจำนวน members ที่มี auth_user_id
    const { count: membersWithAuthId, error: membersError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .not('auth_user_id', 'is', null)

    return NextResponse.json({
      migrationStatus: {
        hasAuthUserIdColumn: !columnsError && columns && columns.length > 0,
        hasHandleNewUserFunction: !functionsError && functions && functions.length > 0,
        hasTrigger: !triggersError && triggers && triggers.length > 0,
        membersWithAuthId: membersWithAuthId || 0,
      },
      details: {
        columnsError,
        functionsError,
        triggersError,
        membersError,
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
