"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut, User, Shield } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "ผู้ดูแลระบบ",
  DESIGNER_INHOUSE: "นักออกแบบ",
  STAFF: "พนักงาน",
};

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Use default values before hydration to match server render
  const displayName = isHydrated
    ? user?.user_name || user?.email || "ผู้ใช้"
    : "ผู้ใช้";
  const roleLabel =
    isHydrated && user?.role_code
      ? ROLE_LABELS[user.role_code] || user.role_code
      : "";

  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-card">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground">
            ระบบจัดการงานพิมพ์
          </h1>
          <Badge variant="outline" className="text-xs">
            v1.0
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">{displayName}</span>
              {roleLabel && (
                <Badge
                  variant="secondary"
                  className="hidden md:inline-flex text-xs"
                >
                  {roleLabel}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium">{displayName}</p>
              {user?.email && (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              )}
              {roleLabel && (
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {roleLabel}
                  </span>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              โปรไฟล์
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
