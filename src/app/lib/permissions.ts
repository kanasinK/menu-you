/**
 * Role-Based Access Control (RBAC) System
 * ระบบจัดการสิทธิ์ตาม Role
 */

// Role codes ที่มีในระบบ
export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    DESIGNER_INHOUSE: 'DESIGNER_INHOUSE',
    STAFF: 'STAFF',
} as const

export type RoleCode = (typeof ROLES)[keyof typeof ROLES]

// Permission definitions
export const PERMISSIONS = {
    // Dashboard
    'dashboard:view': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DESIGNER_INHOUSE, ROLES.STAFF],
    'dashboard:statistics': [ROLES.SUPER_ADMIN, ROLES.ADMIN],

    // Orders
    'orders:view': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DESIGNER_INHOUSE, ROLES.STAFF],
    'orders:view_all': [ROLES.SUPER_ADMIN, ROLES.ADMIN], // ดูออเดอร์ทั้งหมด
    'orders:view_own': [ROLES.DESIGNER_INHOUSE, ROLES.STAFF], // ดูเฉพาะที่ตัวเองรับผิดชอบ
    'orders:create': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF],
    'orders:edit': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    'orders:delete': [ROLES.SUPER_ADMIN],
    'orders:assign': [ROLES.SUPER_ADMIN, ROLES.ADMIN], // มอบหมายงาน
    'orders:update_status': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DESIGNER_INHOUSE],

    // Members
    'members:view': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    'members:create': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    'members:edit': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    'members:delete': [ROLES.SUPER_ADMIN],
    'members:manage_roles': [ROLES.SUPER_ADMIN], // เปลี่ยน role

    // Masters (ข้อมูลมาตรฐาน)
    'masters:view': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    'masters:create': [ROLES.SUPER_ADMIN],
    'masters:edit': [ROLES.SUPER_ADMIN],
    'masters:delete': [ROLES.SUPER_ADMIN],

    // Claims
    'claims:view': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DESIGNER_INHOUSE, ROLES.STAFF],
    'claims:create': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF],
    'claims:edit': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    'claims:resolve': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    'claims:delete': [ROLES.SUPER_ADMIN],

    // Settings
    'settings:view': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    'settings:edit': [ROLES.SUPER_ADMIN],
} as const

export type Permission = keyof typeof PERMISSIONS

/**
 * ตรวจสอบว่า role มีสิทธิ์หรือไม่
 */
export function hasPermission(roleCode: string | undefined | null, permission: Permission): boolean {
    if (!roleCode) return false
    const allowedRoles = PERMISSIONS[permission] as readonly string[]
    return allowedRoles?.includes(roleCode) ?? false
}

/**
 * ตรวจสอบว่า role มีสิทธิ์ทั้งหมดที่ระบุหรือไม่
 */
export function hasAllPermissions(roleCode: string | undefined | null, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(roleCode, permission))
}

/**
 * ตรวจสอบว่า role มีสิทธิ์อย่างน้อยหนึ่งอย่างหรือไม่
 */
export function hasAnyPermission(roleCode: string | undefined | null, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(roleCode, permission))
}

/**
 * ดึง permissions ทั้งหมดของ role
 */
export function getPermissionsForRole(roleCode: string): Permission[] {
    return (Object.keys(PERMISSIONS) as Permission[]).filter(
        permission => (PERMISSIONS[permission] as readonly string[]).includes(roleCode)
    )
}

/**
 * ตรวจสอบว่าเป็น admin level หรือไม่
 */
export function isAdminRole(roleCode: string | undefined | null): boolean {
    if (!roleCode) return false
    return roleCode === ROLES.SUPER_ADMIN || roleCode === ROLES.ADMIN
}

/**
 * ตรวจสอบว่าเป็น super admin หรือไม่
 */
export function isSuperAdmin(roleCode: string | undefined | null): boolean {
    return roleCode === ROLES.SUPER_ADMIN
}

/**
 * Role hierarchy สำหรับเปรียบเทียบ
 */
export const ROLE_HIERARCHY: Record<RoleCode, number> = {
    [ROLES.SUPER_ADMIN]: 100,
    [ROLES.ADMIN]: 80,
    [ROLES.DESIGNER_INHOUSE]: 50,
    [ROLES.STAFF]: 30,
}

/**
 * ตรวจสอบว่า role มีระดับสูงกว่าหรือเท่ากับ target role หรือไม่
 */
export function hasHigherOrEqualRole(roleCode: string | undefined | null, targetRole: RoleCode): boolean {
    if (!roleCode) return false
    const currentLevel = ROLE_HIERARCHY[roleCode as RoleCode] ?? 0
    const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0
    return currentLevel >= targetLevel
}

/**
 * Route permissions mapping
 */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
    '/dashboard': 'dashboard:view',
    '/orders': 'orders:view',
    '/members': 'members:view',
    '/masters': 'masters:view',
    '/claims': 'claims:view',
}

/**
 * ตรวจสอบว่า role สามารถเข้าถึง route ได้หรือไม่
 */
export function canAccessRoute(roleCode: string | undefined | null, pathname: string): boolean {
    // หา matching route
    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    )

    if (!matchedRoute) return true // ไม่มี permission requirement

    const requiredPermission = ROUTE_PERMISSIONS[matchedRoute]
    return hasPermission(roleCode, requiredPermission)
}
