import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null | undefined
let cachedServerClient: SupabaseClient | null | undefined

export const getSupabase = (): SupabaseClient | null => {
  if (cachedClient !== undefined) return cachedClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase env missing, API จะ fallback ไป local data')
    }
    cachedClient = null
    return cachedClient
  }

  cachedClient = createClient(supabaseUrl, supabasePublishableKey)
  return cachedClient
}

// Server-side client with service role key (bypasses RLS)
// ใช้สำหรับ auth.admin functions เท่านั้น
export const getSupabaseServer = (): SupabaseClient | null => {
  if (cachedServerClient !== undefined) return cachedServerClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is missing, falling back to anon key')
    cachedServerClient = getSupabase()
    return cachedServerClient
  }

  cachedServerClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  return cachedServerClient
}
