import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null | undefined

export const getSupabase = (): SupabaseClient | null => {
  if (cachedClient !== undefined) return cachedClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    if (process.env.NODE_ENV !== 'production') {
      // เตือนในโหมดพัฒนาเพื่อให้รู้ว่าใช้ fallback ได้
      // ไม่ throw เพื่อให้ fallback localStorage ทำงานได้
      // eslint-disable-next-line no-console
      console.warn('Supabase env missing, API จะ fallback ไป local data')
    }
    cachedClient = null
    return cachedClient
  }

  cachedClient = createClient(supabaseUrl, supabasePublishableKey)
  return cachedClient
}

// Database configuration for direct connection to Render (disabled)
// export const DATABASE_CONFIG = {
//   url: process.env.DATABASE_URL || '',
//   host: process.env.DB_HOST || '',
//   port: parseInt(process.env.DB_PORT || '5432'),
//   database: process.env.DB_NAME || '',
//   username: process.env.DB_USER || '',
//   password: process.env.DB_PASSWORD || '',
// }
