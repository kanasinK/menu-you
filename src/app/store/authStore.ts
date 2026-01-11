import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { AuthUser, getMemberByAuthId, signIn as supabaseSignIn, signOut as supabaseSignOut } from '@/lib/auth-supabase'
import { getSupabase } from '@/lib/supabase'
import { hasPermission, Permission, canAccessRoute, isAdminRole, isSuperAdmin } from '@/lib/permissions'
import { setAuthCookie, removeAuthCookie } from '@/lib/auth'

interface AuthState {
    user: AuthUser | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

interface AuthActions {
    // Actions
    login: (usernameOrEmail: string, password: string) => Promise<boolean>
    logout: () => Promise<void>
    loadUser: () => Promise<void>
    clearError: () => void

    // Permission helpers
    hasPermission: (permission: Permission) => boolean
    canAccessRoute: (pathname: string) => boolean
    isAdmin: () => boolean
    isSuperAdmin: () => boolean
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,

                // Login
                login: async (usernameOrEmail: string, password: string) => {
                    set({ isLoading: true, error: null })

                    try {
                        const result = await supabaseSignIn(usernameOrEmail, password)

                        if (result.error) {
                            set({
                                error: result.error.message || 'เข้าสู่ระบบไม่สำเร็จ',
                                isLoading: false
                            })
                            return false
                        }

                        if (result.user) {
                            set({
                                user: result.user,
                                isAuthenticated: true,
                                isLoading: false,
                                error: null
                            })
                            setAuthCookie(true)
                            return true
                        }

                        set({
                            error: 'ไม่พบข้อมูลผู้ใช้',
                            isLoading: false
                        })
                        return false
                    } catch (error) {
                        set({
                            error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
                            isLoading: false
                        })
                        return false
                    }
                },

                // Logout
                logout: async () => {
                    set({ isLoading: true })

                    try {
                        await supabaseSignOut()
                    } catch (error) {
                        console.error('Logout error:', error)
                    } finally {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null
                        })
                        removeAuthCookie()
                    }
                },

                // Load user from session
                loadUser: async () => {
                    set({ isLoading: true })

                    try {
                        const supabase = getSupabase()
                        if (!supabase) {
                            set({ isLoading: false })
                            return
                        }

                        const { data: { session } } = await supabase.auth.getSession()

                        if (session?.user) {
                            const member = await getMemberByAuthId(session.user.id)

                            if (member) {
                                set({
                                    user: member,
                                    isAuthenticated: true,
                                    isLoading: false
                                })
                                setAuthCookie(true)
                                return
                            }
                        }

                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false
                        })
                    } catch (error) {
                        console.error('Load user error:', error)
                        set({ isLoading: false })
                    }
                },

                // Clear error
                clearError: () => set({ error: null }),

                // Permission helpers
                hasPermission: (permission: Permission) => {
                    const { user } = get()
                    return hasPermission(user?.role_code, permission)
                },

                canAccessRoute: (pathname: string) => {
                    const { user } = get()
                    return canAccessRoute(user?.role_code, pathname)
                },

                isAdmin: () => {
                    const { user } = get()
                    return isAdminRole(user?.role_code)
                },

                isSuperAdmin: () => {
                    const { user } = get()
                    return isSuperAdmin(user?.role_code)
                },
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    user: state.user,
                    isAuthenticated: state.isAuthenticated
                }),
            }
        ),
        { name: 'AuthStore' }
    )
)

// Selector hooks for convenience
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)
