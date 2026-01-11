'use client'

import { useEffect, ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Provider component สำหรับ load user session เมื่อ app start
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { loadUser, isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    // Load user ถ้ายังไม่มี user แต่มี isAuthenticated flag
    if (isAuthenticated && !user) {
      loadUser()
    }
  }, [isAuthenticated, user, loadUser])

  return <>{children}</>
}
