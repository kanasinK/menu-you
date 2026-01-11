"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Permission } from "@/lib/permissions";

/**
 * Hook to handle hydration state for permission checks
 */
function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  return isHydrated;
}

interface PermissionGateProps {
  /** Permission ที่ต้องการ */
  permission: Permission;
  /** Content ที่จะแสดงถ้ามีสิทธิ์ */
  children: ReactNode;
  /** Content ที่จะแสดงถ้าไม่มีสิทธิ์ (optional) */
  fallback?: ReactNode;
}

/**
 * Component สำหรับซ่อน/แสดง content ตาม permission
 *
 * @example
 * <PermissionGate permission="members:delete">
 *   <DeleteButton />
 * </PermissionGate>
 *
 * @example
 * <PermissionGate
 *   permission="orders:edit"
 *   fallback={<span>ไม่มีสิทธิ์แก้ไข</span>}
 * >
 *   <EditButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isHydrated = useHydrated();

  // Before hydration, render children to match server
  if (!isHydrated) {
    return <>{children}</>;
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface MultiPermissionGateProps {
  /** Permissions ที่ต้องการ */
  permissions: Permission[];
  /** ต้องมีทุก permission (true) หรือ อย่างน้อยหนึ่ง (false) */
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component สำหรับตรวจสอบหลาย permissions
 *
 * @example
 * <MultiPermissionGate permissions={['orders:edit', 'orders:delete']} requireAll>
 *   <AdminActions />
 * </MultiPermissionGate>
 */
export function MultiPermissionGate({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: MultiPermissionGateProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isHydrated = useHydrated();

  // Before hydration, render children to match server
  if (!isHydrated) {
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? permissions.every((p) => hasPermission(p))
    : permissions.some((p) => hasPermission(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Shortcut component สำหรับแสดงเฉพาะ Admin
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isHydrated = useHydrated();

  // Before hydration, render children to match server
  if (!isHydrated) {
    return <>{children}</>;
  }

  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Shortcut component สำหรับแสดงเฉพาะ Super Admin
 */
export function SuperAdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);
  const isHydrated = useHydrated();

  // Before hydration, render children to match server
  if (!isHydrated) {
    return <>{children}</>;
  }

  if (!isSuperAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
