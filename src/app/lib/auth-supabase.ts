import { getSupabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'
import { loadingActions } from '@/store/loadingStore'

export interface AuthUser {
  id: string
  email: string
  user_name?: string
  role_code?: string
}

export interface AuthResponse {
  user: AuthUser | null
  session: Session | null
  error: Error | null
}

/**
 * ค้นหา email และ auth_user_id จาก username
 */
async function getMemberByUsername(username: string): Promise<{ email: string; auth_user_id: string | null } | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('members')
    .select('email, auth_user_id')
    .eq('user_name', username)
    .single()

  if (error || !data) return null

  // Email เป็น required field แล้ว
  if (!data.email) {
    return null
  }

  return {
    email: data.email,
    auth_user_id: data.auth_user_id
  }
}

/**
 * ลงชื่อเข้าใช้ด้วย username/email และ password
 */
export async function signIn(usernameOrEmail: string, password: string): Promise<AuthResponse> {
  loadingActions.start()
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase client is not configured')
      }
    }

    // ตรวจสอบว่าเป็น email หรือ username
    let email = usernameOrEmail
    if (!usernameOrEmail.includes('@')) {
      // ถ้าไม่มี @ แสดงว่าเป็น username ให้หาข้อมูล member
      const memberData = await getMemberByUsername(usernameOrEmail)

      if (!memberData) {
        return {
          user: null,
          session: null,
          error: new Error('ไม่พบชื่อผู้ใช้นี้ในระบบหรือบัญชีไม่มีอีเมล')
        }
      }

      // ตรวจสอบว่า member มี auth_user_id หรือไม่
      if (!memberData.auth_user_id) {
        return {
          user: null,
          session: null,
          error: new Error('บัญชีนี้ยังไม่ได้เชื่อมโยงกับระบบ Authentication กรุณาติดต่อผู้ดูแลระบบ')
        }
      }

      email = memberData.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, session: null, error }
    }

    // ดึงข้อมูล member จาก database
    const member = await getMemberByAuthId(data.user.id)

    return {
      user: member,
      session: data.session,
      error: null,
    }
  } finally {
    loadingActions.stop()
  }
}

/**
 * สร้างบัญชีใหม่
 */
export async function signUp(
  email: string,
  password: string,
  userData: { user_name?: string; nickname?: string; role_code?: string }
): Promise<AuthResponse> {
  loadingActions.start()
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase client is not configured')
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: userData.user_name,
          nickname: userData.nickname,
          role_code: userData.role_code || 'STAFF',
        },
      },
    })

    if (error) {
      return { user: null, session: null, error }
    }

    if (!data.user) {
      return {
        user: null,
        session: null,
        error: new Error('User creation failed')
      }
    }

    // ดึงข้อมูล member จาก database
    const member = await getMemberByAuthId(data.user.id)

    return {
      user: member,
      session: data.session,
      error: null,
    }
  } finally {
    loadingActions.stop()
  }
}

/**
 * ออกจากระบบ
 */
export async function signOut(): Promise<{ error: Error | null }> {
  loadingActions.start()
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return { error: new Error('Supabase client is not configured') }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  } finally {
    loadingActions.stop()
  }
}

/**
 * ดึงข้อมูล session ปัจจุบัน
 */
export async function getSession(): Promise<{ session: Session | null; error: Error | null }> {
  loadingActions.start()
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return { session: null, error: new Error('Supabase client is not configured') }
    }

    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  } finally {
    loadingActions.stop()
  }
}

/**
 * ดึงข้อมูล user ปัจจุบัน
 */
export async function getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
  loadingActions.start()
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return { user: null, error: new Error('Supabase client is not configured') }
    }

    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  } finally {
    loadingActions.stop()
  }
}

/**
 * ดึงข้อมูล member จาก auth_user_id
 */
export async function getMemberByAuthId(authUserId: string): Promise<AuthUser | null> {
  const supabase = getSupabase()

  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('members')
    .select('id, user_name, email, role_code, status')
    .eq('auth_user_id', authUserId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    email: data.email || '',
    user_name: data.user_name,
    role_code: data.role_code,
  }
}

/**
 * ตรวจสอบว่า user login อยู่หรือไม่
 */
export async function isAuthenticated(): Promise<boolean> {
  const { session } = await getSession()
  return !!session
}
