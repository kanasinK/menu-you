import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardClient from "@/components/DashboardClient";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">แดชบอร์ด</h1>
          <p className="text-muted-foreground">
            ภาพรวมการดำเนินงานระบบจัดการงานพิมพ์
          </p>
        </div>
        <Button asChild className="bg-gradient-primary">
          <Link href="/orders/new">
            <Plus className="h-4 w-4 mr-2" />
            สร้างออเดอร์ใหม่
          </Link>
        </Button>
      </div>

      <DashboardClient />
    </div>
  );
}
