import axios from 'axios'
import { loadingActions } from '@/store/loadingStore'
import { getSupabase } from '@/lib/supabase'

export const http = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - start loading and add auth header
http.interceptors.request.use(
  async config => {
    loadingActions.start()
    
    // Add auth header if available
    try {
      const supabase = getSupabase()
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`
        }
      }
    } catch {
      // Ignore auth errors, continue with request
    }
    
    return config
  },
  error => {
    loadingActions.stop()
    return Promise.reject(error)
  }
)

// Response interceptor - stop loading
http.interceptors.response.use(
  response => {
    loadingActions.stop()
    return response
  },
  error => {
    loadingActions.stop()
    return Promise.reject(error)
  }
)

