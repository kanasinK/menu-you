"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  AlertTriangle,
  Package,
  Database,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { Permission } from "@/lib/permissions";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
}

const menuItems: MenuItem[] = [
  {
    title: "แดชบอร์ด",
    url: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard:view",
  },
  {
    title: "ออเดอร์",
    url: "/orders",
    icon: ShoppingCart,
    permission: "orders:view",
  },
  {
    title: "สมาชิก",
    url: "/members",
    icon: Users,
    permission: "members:view",
  },
  {
    title: "ข้อมูลมาตรฐาน",
    url: "/masters",
    icon: Settings,
    permission: "masters:view",
  },
  {
    title: "การ Claim",
    url: "/claims",
    icon: AlertTriangle,
    permission: "claims:view",
  },
  {
    title: "ทดสอบ Supabase",
    url: "/test-supabase",
    icon: Database,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const { hasPermission } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration to complete before filtering by permissions
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Filter menu items based on permissions (only after hydration)
  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true;
    // Before hydration, show all items to match server render
    if (!isHydrated) return true;
    return hasPermission(item.permission);
  });

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-colors";
    return isActive(path)
      ? `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90`
      : `${baseClasses} hover:bg-accent hover:text-accent-foreground`;
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-primary px-4 py-6">
            <Package className="h-6 w-6 mr-2" />
            {state !== "collapsed" && "ระบบจัดการ"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-5 w-5" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
