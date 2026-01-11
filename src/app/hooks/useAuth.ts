'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Permission } from '@/lib/permissions'

/**
 * Hook สำหรับใช้งาน authentication และ authorization
 */
export function useAuth() {
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        loadUser,
        clearError,
        hasPermission,
        canAccessRoute,
        isAdmin,
        isSuperAdmin,
    } = useAuthStore()

    // Load user on mount
    useEffect(() => {
        if (!user && !isLoading) {
            loadUser()
        }
    }, [user, isLoading, loadUser])

    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        error,
        roleCode: user?.role_code,

        // Actions
        login,
        logout,
        loadUser,
        clearError,

        // Permission helpers
        hasPermission,
        canAccessRoute,
        isAdmin,
        isSuperAdmin,

        // Convenience getters
        userName: user?.user_name || user?.email || 'ผู้ใช้',
        email: user?.email,
    }
}

/**
 * Hook สำหรับตรวจสอบ permission เฉพาะ
 */
export function usePermission(permission: Permission): boolean {
    const { hasPermission } = useAuthStore()
    return hasPermission(permission)
}

/**
 * Hook สำหรับตรวจสอบหลาย permissions
 */
export function usePermissions(permissions: Permission[]): Record<Permission, boolean> {
    const { hasPermission } = useAuthStore()

    return permissions.reduce((acc, permission) => {
        acc[permission] = hasPermission(permission)
        return acc
    }, {} as Record<Permission, boolean>)
}

/**
 * Hook สำหรับ require permission (redirect ถ้าไม่มีสิทธิ์)
 */
export function useRequirePermission(permission: Permission) {
    const { hasPermission, isLoading, isAuthenticated } = useAuthStore()

    const allowed = hasPermission(permission)

    return {
        allowed,
        isLoading,
        isAuthenticated,
        shouldRedirect: !isLoading && isAuthenticated && !allowed,
    }
}
